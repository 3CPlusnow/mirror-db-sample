const io = require("socket.io-client");
const { createTable, createDatabase } = require("./database-manager");
const { mapCallHistory, generateMultiRowInsert } = require("./call-history-map");
const redisConnector = require('./redis-connector');
const databaseConnector = require("./database-connector");

const Queue = require('bull');
const dataQueue = new Queue('dataQueue', {
    redis: {
        host: 'localhost',
        port: 6379,
    },
    DefaultJobOptions: {
        attempts: 3, // Replace with your desired value
        backoff: {
            type: 'exponential',
            delay: 1000, // Replace with your desired value
        },
    },
    settings: {
        retentionPeriod: 10 * 60 * 1000, // 30 minutes in milliseconds
    },
});

let pool = null;
let showInserted = false;

async function start() {
    pool = await databaseConnector();

    try {
        await createDatabase(pool);
        await createTable(pool);
    } catch (error) {
        console.error("[CREATE DATABASE / TABLE] - error at creating database or table");
        console.error(error);
        process.exit(1);
    }
}
start();

dataQueue.on('failed', (job, error) => {
console.error('[DATA QUEUE] - Job processing failed:', error.message);
});

dataQueue.on('error', (error) => {
    console.error('Queue error:', error.message);
});

dataQueue.on('failed', async (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}. Attempts left: ${job.attemptsMade}/${job.opts.attempts}`);

    if (job.attemptsMade >= job.opts.attempts) {
        await job.remove();
        console.log(`Job ${job.id} removed from the queue after reaching max retries.`);
    }
});

const insertData = async (query) => {
    try {
        await pool.query(query);
        if(showInserted){
            console.log("[INSERT DATA] - successfully inserted data");
            showInserted = false;
        }
    } catch (error) {
        console.error("[INSERT DATA] - error at inserting query");
        console.error(query);
        console.error(error);
    }
};

dataQueue.on('completed', (job) => {
    job.remove()
});

dataQueue.process('dataQueue', async (job) => {
    const { jsonData } = job.data;

    try {
        const rowDataArray = await mapCallHistory(JSON.parse(jsonData));
        if (rowDataArray.length === 0) {
            console.log('No data to insert.');
            return;
        }

        const query = generateMultiRowInsert(rowDataArray);
        if (!query) {
            console.log('No data to insert.');
            return;
        }
        await insertData(query);
    } catch (error) {
        console.log("[MAP CALLHISTORY] - Error at mapping call history events");
        console.log(error);
    }
});

const SOCKET_SERVER = process.env.SOCKET_SERVER;
const SOCKET_TOKEN = process.env.SOCKET_TOKEN;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10);
let eventBatch = [];

const socket = io(SOCKET_SERVER, {
    reconnection: true,
    transports: ["websocket"],
    query: { token: SOCKET_TOKEN },
});

socket.on("connect", () => {
    console.log("Socket.IO is connected");
});

socket.on("disconnect", (reason) => {
    console.error("Socket.IO is disconnected: ", reason);
    showInserted = true;
});

socket.on("call-history-was-created", (event) => {
    eventBatch.push(event);
    if (eventBatch.length >= BATCH_SIZE) {
        if(showInserted) console.log(`[BATCH INSERTED] - ${eventBatch.length} events inserted on queue`);
        redisConnector(dataQueue, eventBatch);
        eventBatch = [];
    }
});

socket.on("error", (error) => {
    console.error("Socket.IO error: ", error);
});

socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error: ", error);
});

socket.on("reconnect", (error) => {
    console.error("Socket.IO reconnect: ", error);
});

socket.on("reconnect_attempt", (attempt) => {
    console.error("Socket.IO reconnection attempt: ", attempt);
});

socket.on("reconnect_failed", () => {
    console.error("Socket.IO reconnection failed: ");
});
