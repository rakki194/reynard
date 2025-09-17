export declare abstract class RetryStrategy {
    maxAttempts: number;
    baseDelaySec: number;
    constructor(maxAttempts?: number, baseDelaySec?: number);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    protected abstract calculateDelayMs(attempt: number): number;
}
export declare class ExponentialBackoffRetry extends RetryStrategy {
    private multiplier;
    constructor(maxAttempts?: number, baseDelaySec?: number, multiplier?: number);
    protected calculateDelayMs(attempt: number): number;
}
export declare class LinearBackoffRetry extends RetryStrategy {
    private incrementSec;
    constructor(maxAttempts?: number, baseDelaySec?: number, incrementSec?: number);
    protected calculateDelayMs(attempt: number): number;
}
export declare class JitterRetry extends RetryStrategy {
    private jitterFactor;
    constructor(maxAttempts?: number, baseDelaySec?: number, jitterFactor?: number);
    protected calculateDelayMs(attempt: number): number;
}
