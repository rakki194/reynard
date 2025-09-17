import { ConnectionPool } from "./pool";
import { WebSocketConnection } from "./websocket";
import { PoolConfig, ConnectionConfig } from "./types";
export declare class WebSocketConnectionPool extends ConnectionPool<WebSocketConnection> {
    private connConfig;
    constructor(poolConfig: PoolConfig, connConfig: ConnectionConfig);
}
