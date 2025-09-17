import { HealthCheckResult } from "./types";
export declare class HealthChecker {
    private intervalSec;
    private timeoutSec;
    private task?;
    private checks;
    start(): Promise<void>;
    stop(): Promise<void>;
    add(id: string, fn: () => Promise<void>): void;
    remove(id: string): void;
    private run;
    static result(connectionId: string, isHealthy: boolean, responseTime: number, errorMessage?: string, details?: Record<string, unknown>): HealthCheckResult;
}
