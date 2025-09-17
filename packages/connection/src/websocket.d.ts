import { BaseConnection } from "./base";
import { ConnectionConfig, HealthCheckResult } from "./types";
export declare class WebSocketConnection extends BaseConnection {
    private ws?;
    constructor(config: ConnectionConfig);
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    isConnected(): Promise<boolean>;
    healthCheck(): Promise<HealthCheckResult>;
    protected sendImpl(data: unknown): Promise<boolean>;
    protected receiveImpl(): Promise<unknown>;
}
