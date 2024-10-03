async function createDatabase(pool) {
  try {
    // Check if the 'bi' database exists
    const checkDbExistsQuery = `SELECT COUNT(*) AS dbCount FROM sys.databases WHERE name = 'bi'`;
    const result = await pool.request().query(checkDbExistsQuery);

    // If 'bi' database doesn't exist, create it
    if (result.recordset[0].dbCount === 0) {
      const createDbQuery = `CREATE DATABASE bi`;
      await pool.request().query(createDbQuery);
      console.log("[CREATE DATABASE] - Database 'bi' created successfully.");
    } else {
      console.log("[CREATE DATABASE] - Database 'bi' already exists.");
    }
  } catch (err) {
    console.error("[CREATE DATABASE] - " + err);
    throw err;
  }
}

async function createTable(pool) {
  try {
    const tableName = "call_history";

    const checkTableQuery = `
      SELECT TABLE_NAME
      FROM bi.INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME = '${tableName}';
    `;

    const { recordset } = await pool.request().query(checkTableQuery);
    if (recordset.length === 0) {
      const query = `
        CREATE LOGIN [client_readonly] WITH PASSWORD = '${process.env.READONLY_PASSWORD}';
        USE bi;
        CREATE USER [client_readonly] FOR LOGIN [client_readonly];
        EXEC sp_addrolemember 'db_datareader', 'client_readonly';

        GRANT EXECUTE TO [client_readonly];
        CREATE TABLE bi.dbo.${tableName} (
          _id VARCHAR(255) PRIMARY KEY,
          number VARCHAR(255),
          campaign_id INT,
          campaign_name VARCHAR(255),
          company_id INT,
          company_name VARCHAR(255),
          phone_type VARCHAR(255),
          agent_id INT,
          agent_name VARCHAR(255),
          route_id INT,
          route_name VARCHAR(255),
          route_host VARCHAR(255),
          route_route INT,
          route_endpoint VARCHAR(255),
          route_caller_id INT,
          telephony_id VARCHAR(255),
          status INT,
          qualification_id VARCHAR(255),
          qualification_name VARCHAR(255),
          qualification_behavior INT,
          qualification_behavior_text VARCHAR(255),
          qualification_conversion BIT,
          qualification_is_dmc BIT,
          billed_time INT,
          billed_value FLOAT,
          rate_value FLOAT,
          amd_status INT,
          hangup_cause INT,
          recorded BIT,
          ended_by_agent BIT,
          qualification_note TEXT,
          sid VARCHAR(255),
          call_mode VARCHAR(255),
          list_id INT,
          list_name VARCHAR(255),
          list_original_name VARCHAR(255),
          call_date DATETIME,
          calling_time INT,
          waiting_time INT,
          speaking_time INT,
          speaking_with_agent_time INT,
          acw_time INT,
          receptive_name VARCHAR(255),
          receptive_phone VARCHAR(255),
          receptive_did VARCHAR(255),
          queue_id INT,
          queue_name VARCHAR(255),
          ivr_id INT,
          ivr_name VARCHAR(255),
          parent_id VARCHAR(255),
          random_consult_id VARCHAR(255),
          transfer_recording VARCHAR(255),
          ivr_after_call BIT,
          criteria TEXT,
          max_time_exceeded INT,
          custom_updated_at DATETIME,
          custom_created_at DATETIME,
          hangup_cause_text VARCHAR(50),
          hangup_cause_color VARCHAR(16),
          hangup_cause_id INT,
          mailing_data NVARCHAR(MAX)
        );
        `;

      await pool.request().query(query);
      console.log(`$[CREATE TABLE] - {tableName} table created successfully.`);
    } else {
      console.log("[CREATE TABLE] - table already created");
    }
  } catch (error) {
    console.error("[CREATE TABLE] - Error creating table:", error);
    throw error;
  }
}

module.exports = {
  createDatabase,
  createTable,
};
