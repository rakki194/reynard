/**
 * Retry Logic for Error Handling
 *
 * Retry utilities and strategies for handling transient errors
 * across the Reynard framework.
 */
import { ReynardError, isReynardError, isNetworkError, isTimeoutError, isRateLimitError, } from "./core";
// ============================================================================
// Retry Strategies
// ============================================================================
/**
 * Exponential backoff retry strategy
 */
export const exponentialBackoffStrategy = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: (error) => {
        return (isNetworkError(error) ||
            isTimeoutError(error) ||
            (isReynardError(error) && error.code === "RATE_LIMIT_ERROR"));
    },
};
/**
 * Linear backoff retry strategy
 */
export const linearBackoffStrategy = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 1,
    jitter: false,
    retryCondition: (error) => {
        return isNetworkError(error) || isTimeoutError(error);
    },
};
/**
 * Fixed delay retry strategy
 */
export const fixedDelayStrategy = {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 2000,
    backoffFactor: 1,
    jitter: false,
    retryCondition: (error) => {
        return isNetworkError(error);
    },
};
/**
 * Aggressive retry strategy for critical operations
 */
export const aggressiveRetryStrategy = {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 60000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: (error) => {
        return (isNetworkError(error) ||
            isTimeoutError(error) ||
            (isReynardError(error) && error.code === "RATE_LIMIT_ERROR"));
    },
};
/**
 * Conservative retry strategy for non-critical operations
 */
export const conservativeRetryStrategy = {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: (error) => {
        return isNetworkError(error);
    },
};
// ============================================================================
// Retry Implementation
// ============================================================================
/**
 * Retry a function with the specified configuration
 */
export async function retry(fn, config = exponentialBackoffStrategy) {
    const startTime = Date.now();
    let lastError;
    let attempts = 0;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        attempts = attempt + 1;
        try {
            const result = await fn();
            const totalTime = Date.now() - startTime;
            return {
                success: true,
                data: result,
                attempts,
                totalTime,
            };
        }
        catch (error) {
            lastError = isReynardError(error)
                ? error
                : new ReynardError(error instanceof Error ? error.message : "Unknown error", "RETRY_ERROR", { source: "retry" });
            // Check if we should retry
            if (attempt < config.maxRetries &&
                config.retryCondition(lastError, attempt)) {
                const delay = calculateDelay(attempt, config);
                await sleep(delay);
                continue;
            }
            // Don't retry or max retries reached
            break;
        }
    }
    const totalTime = Date.now() - startTime;
    return {
        success: false,
        error: lastError,
        attempts,
        totalTime,
    };
}
/**
 * Retry with exponential backoff
 */
export async function retryWithExponentialBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    const result = await retry(fn, {
        ...exponentialBackoffStrategy,
        maxRetries,
        baseDelay,
    });
    if (result.success) {
        return result.data;
    }
    throw result.error;
}
/**
 * Retry with linear backoff
 */
export async function retryWithLinearBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    const result = await retry(fn, {
        ...linearBackoffStrategy,
        maxRetries,
        baseDelay,
    });
    if (result.success) {
        return result.data;
    }
    throw result.error;
}
/**
 * Retry with fixed delay
 */
export async function retryWithFixedDelay(fn, maxRetries = 3, delay = 2000) {
    const result = await retry(fn, {
        ...fixedDelayStrategy,
        maxRetries,
        baseDelay: delay,
        maxDelay: delay,
    });
    if (result.success) {
        return result.data;
    }
    throw result.error;
}
// ============================================================================
// Retry Utilities
// ============================================================================
/**
 * Calculate delay for retry attempt
 */
export function calculateDelay(attempt, config) {
    let delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay);
    // Apply jitter to prevent thundering herd
    if (config.jitter) {
        const jitterAmount = delay * 0.1; // 10% jitter
        delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    return Math.max(0, delay);
}
/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    if (isNetworkError(error)) {
        return true;
    }
    if (isTimeoutError(error)) {
        return true;
    }
    if (isRateLimitError(error)) {
        return true;
    }
    if (isReynardError(error)) {
        // Check for specific retryable error codes
        const retryableCodes = [
            "NETWORK_ERROR",
            "TIMEOUT_ERROR",
            "RATE_LIMIT_ERROR",
            "TEMPORARY_ERROR",
            "SERVICE_UNAVAILABLE",
        ];
        return retryableCodes.includes(error.code);
    }
    return false;
}
/**
 * Create retry condition for specific error types
 */
export function createRetryCondition(errorTypes, statusCodes) {
    return (error, attempt) => {
        if (isReynardError(error)) {
            // Check error code
            if (errorTypes.includes(error.code)) {
                return true;
            }
            // Check status code if available
            if (statusCodes &&
                "status" in error.context &&
                typeof error.context.status === "number") {
                return statusCodes.includes(error.context.status);
            }
        }
        return false;
    };
}
/**
 * Create retry condition for network errors only
 */
export function createNetworkRetryCondition() {
    return (error) => isNetworkError(error);
}
/**
 * Create retry condition for timeout errors only
 */
export function createTimeoutRetryCondition() {
    return (error) => isTimeoutError(error);
}
/**
 * Create retry condition for rate limit errors only
 */
export function createRateLimitRetryCondition() {
    return (error) => isRateLimitError(error);
}
// ============================================================================
// Retry Decorators
// ============================================================================
/**
 * Decorator for retrying async functions
 */
export function withRetry(config = exponentialBackoffStrategy) {
    return (fn) => {
        return (async (...args) => {
            const result = await retry(() => fn(...args), config);
            if (result.success) {
                return result.data;
            }
            throw result.error;
        });
    };
}
/**
 * Decorator for retrying with exponential backoff
 */
export function withExponentialBackoff(maxRetries = 3, baseDelay = 1000) {
    return withRetry({
        ...exponentialBackoffStrategy,
        maxRetries,
        baseDelay,
    });
}
/**
 * Decorator for retrying with linear backoff
 */
export function withLinearBackoff(maxRetries = 3, baseDelay = 1000) {
    return withRetry({
        ...linearBackoffStrategy,
        maxRetries,
        baseDelay,
    });
}
/**
 * Decorator for retrying with fixed delay
 */
export function withFixedDelay(maxRetries = 3, delay = 2000) {
    return withRetry({
        ...fixedDelayStrategy,
        maxRetries,
        baseDelay: delay,
        maxDelay: delay,
    });
}
export class RetryMonitor {
    constructor() {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                totalAttempts: 0,
                successfulAttempts: 0,
                failedAttempts: 0,
                averageRetryTime: 0,
                retryReasons: {},
            }
        });
    }
    recordAttempt(success, retryReason, duration) {
        this.metrics.totalAttempts++;
        if (success) {
            this.metrics.successfulAttempts++;
        }
        else {
            this.metrics.failedAttempts++;
        }
        if (retryReason) {
            this.metrics.retryReasons[retryReason] =
                (this.metrics.retryReasons[retryReason] || 0) + 1;
        }
        if (duration !== undefined) {
            const totalTime = this.metrics.averageRetryTime * (this.metrics.totalAttempts - 1) +
                duration;
            this.metrics.averageRetryTime = totalTime / this.metrics.totalAttempts;
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    reset() {
        this.metrics = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            averageRetryTime: 0,
            retryReasons: {},
        };
    }
}
/**
 * Global retry monitor
 */
export const globalRetryMonitor = new RetryMonitor();
