export declare class ConnectionMetricsTracker {
    private windowSize;
    private responseTimes;
    private errorCounts;
    private success;
    private failed;
    private startTime;
    private lastRequest?;
    private lastResponse?;
    constructor(windowSize?: number);
    record(responseTime: number, success: boolean, errorType?: string): void;
    averageResponseTime(): number;
    errorRate(): number;
    throughput(windowSeconds?: number): number;
    uptime(): number;
    summary(): Record<string, unknown>;
}
