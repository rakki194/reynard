/**
 * Retry Logic for Error Handling
 *
 * Retry utilities and strategies for handling transient errors
 * across the Reynard framework.
 */
import { ReynardError } from "./core";
export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
    jitter: boolean;
    retryCondition: (error: unknown, attempt: number) => boolean;
}
export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: ReynardError;
    attempts: number;
    totalTime: number;
}
/**
 * Exponential backoff retry strategy
 */
export declare const exponentialBackoffStrategy: RetryConfig;
/**
 * Linear backoff retry strategy
 */
export declare const linearBackoffStrategy: RetryConfig;
/**
 * Fixed delay retry strategy
 */
export declare const fixedDelayStrategy: RetryConfig;
/**
 * Aggressive retry strategy for critical operations
 */
export declare const aggressiveRetryStrategy: RetryConfig;
/**
 * Conservative retry strategy for non-critical operations
 */
export declare const conservativeRetryStrategy: RetryConfig;
/**
 * Retry a function with the specified configuration
 */
export declare function retry<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<RetryResult<T>>;
/**
 * Retry with exponential backoff
 */
export declare function retryWithExponentialBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
/**
 * Retry with linear backoff
 */
export declare function retryWithLinearBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
/**
 * Retry with fixed delay
 */
export declare function retryWithFixedDelay<T>(fn: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
/**
 * Calculate delay for retry attempt
 */
export declare function calculateDelay(attempt: number, config: RetryConfig): number;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Check if error is retryable
 */
export declare function isRetryableError(error: unknown): boolean;
/**
 * Create retry condition for specific error types
 */
export declare function createRetryCondition(errorTypes: string[], statusCodes?: number[]): (error: unknown, attempt: number) => boolean;
/**
 * Create retry condition for network errors only
 */
export declare function createNetworkRetryCondition(): (error: unknown, attempt: number) => boolean;
/**
 * Create retry condition for timeout errors only
 */
export declare function createTimeoutRetryCondition(): (error: unknown, attempt: number) => boolean;
/**
 * Create retry condition for rate limit errors only
 */
export declare function createRateLimitRetryCondition(): (error: unknown, attempt: number) => boolean;
/**
 * Decorator for retrying async functions
 */
export declare function withRetry<T extends (...args: any[]) => Promise<any>>(config?: RetryConfig): (fn: T) => T;
/**
 * Decorator for retrying with exponential backoff
 */
export declare function withExponentialBackoff<T extends (...args: any[]) => Promise<any>>(maxRetries?: number, baseDelay?: number): (fn: T) => T;
/**
 * Decorator for retrying with linear backoff
 */
export declare function withLinearBackoff<T extends (...args: any[]) => Promise<any>>(maxRetries?: number, baseDelay?: number): (fn: T) => T;
/**
 * Decorator for retrying with fixed delay
 */
export declare function withFixedDelay<T extends (...args: any[]) => Promise<any>>(maxRetries?: number, delay?: number): (fn: T) => T;
export interface RetryMetrics {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    averageRetryTime: number;
    retryReasons: Record<string, number>;
}
export declare class RetryMonitor {
    private metrics;
    recordAttempt(success: boolean, retryReason?: string, duration?: number): void;
    getMetrics(): RetryMetrics;
    reset(): void;
}
/**
 * Global retry monitor
 */
export declare const globalRetryMonitor: RetryMonitor;
