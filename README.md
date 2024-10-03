# socket-data-extractor


## Getting started

### Prerequisites

Create a folder mssql_data and give permissions to it `sudo chown 10001:10001 mssql_data`. Configure the `SOCKET_SERVER` and `SOCKET_TOKEN` on env.

```sh
~> docker compose up -d sql-server redis
~> yarn && yarn start

```
