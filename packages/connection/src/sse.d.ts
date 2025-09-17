import { BaseConnection } from "./base";
import { ConnectionConfig, HealthCheckResult } from "./types";
export declare class SSEConnection extends BaseConnection {
    private es?;
    constructor(config: ConnectionConfig);
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    isConnected(): Promise<boolean>;
    healthCheck(): Promise<HealthCheckResult>;
    protected sendImpl(_data: unknown): Promise<boolean>;
    protected receiveImpl(): Promise<unknown>;
}
