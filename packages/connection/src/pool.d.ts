import { PoolConfig } from "./types";
export declare class ConnectionPool<T extends {
    disconnect?: () => Promise<void | boolean>;
} = any> {
    readonly config: PoolConfig;
    private pool;
    private inUse;
    private factory?;
    private cleanupTimer?;
    private healthTimer?;
    constructor(config: PoolConfig);
    setFactory(factory: () => Promise<T | null>): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    acquire(timeoutSec?: number): Promise<T | null>;
    release(conn: T): Promise<boolean>;
    private create;
    private ident;
    private markInUse;
    private close;
    private closeAll;
    private cleanupIdle;
    private healthCheck;
    stats(): {
        pool_size: number;
        in_use: number;
        total_connections: number;
        max_size: number;
        min_size: number;
        available: number;
        utilization: number;
    };
}
