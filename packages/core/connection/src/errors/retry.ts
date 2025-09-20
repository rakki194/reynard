/**
 * Retry Logic for Error Handling
 *
 * Retry utilities and strategies for handling transient errors
 * across the Reynard framework.
 */

import {
  ReynardError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  isReynardError,
  isNetworkError,
  isTimeoutError,
  isRateLimitError,
} from "./core";

// ============================================================================
// Retry Configuration
// ============================================================================

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

// ============================================================================
// Retry Strategies
// ============================================================================

/**
 * Exponential backoff retry strategy
 */
export const exponentialBackoffStrategy: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
  retryCondition: (error: unknown) => {
    return (
      isNetworkError(error) || isTimeoutError(error) || (isReynardError(error) && error.code === "RATE_LIMIT_ERROR")
    );
  },
};

/**
 * Linear backoff retry strategy
 */
export const linearBackoffStrategy: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 1,
  jitter: false,
  retryCondition: (error: unknown) => {
    return isNetworkError(error) || isTimeoutError(error);
  },
};

/**
 * Fixed delay retry strategy
 */
export const fixedDelayStrategy: RetryConfig = {
  maxRetries: 3,
  baseDelay: 2000,
  maxDelay: 2000,
  backoffFactor: 1,
  jitter: false,
  retryCondition: (error: unknown) => {
    return isNetworkError(error);
  },
};

/**
 * Aggressive retry strategy for critical operations
 */
export const aggressiveRetryStrategy: RetryConfig = {
  maxRetries: 5,
  baseDelay: 500,
  maxDelay: 60000,
  backoffFactor: 2,
  jitter: true,
  retryCondition: (error: unknown) => {
    return (
      isNetworkError(error) || isTimeoutError(error) || (isReynardError(error) && error.code === "RATE_LIMIT_ERROR")
    );
  },
};

/**
 * Conservative retry strategy for non-critical operations
 */
export const conservativeRetryStrategy: RetryConfig = {
  maxRetries: 2,
  baseDelay: 2000,
  maxDelay: 10000,
  backoffFactor: 2,
  jitter: true,
  retryCondition: (error: unknown) => {
    return isNetworkError(error);
  },
};

// ============================================================================
// Retry Implementation
// ============================================================================

/**
 * Retry a function with the specified configuration
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = exponentialBackoffStrategy
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let lastError: ReynardError;
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
    } catch (error) {
      lastError = isReynardError(error)
        ? error
        : new ReynardError(error instanceof Error ? error.message : "Unknown error", "RETRY_ERROR", {
            source: "retry",
          });

      // Check if we should retry
      if (attempt < config.maxRetries && config.retryCondition(lastError, attempt)) {
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
    error: lastError!,
    attempts,
    totalTime,
  };
}

/**
 * Retry with exponential backoff
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  const result = await retry(fn, {
    ...exponentialBackoffStrategy,
    maxRetries,
    baseDelay,
  });

  if (result.success) {
    return result.data!;
  }

  throw result.error;
}

/**
 * Retry with linear backoff
 */
export async function retryWithLinearBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  const result = await retry(fn, {
    ...linearBackoffStrategy,
    maxRetries,
    baseDelay,
  });

  if (result.success) {
    return result.data!;
  }

  throw result.error;
}

/**
 * Retry with fixed delay
 */
export async function retryWithFixedDelay<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> {
  const result = await retry(fn, {
    ...fixedDelayStrategy,
    maxRetries,
    baseDelay: delay,
    maxDelay: delay,
  });

  if (result.success) {
    return result.data!;
  }

  throw result.error;
}

// ============================================================================
// Retry Utilities
// ============================================================================

/**
 * Calculate delay for retry attempt
 */
export function calculateDelay(attempt: number, config: RetryConfig): number {
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
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
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
export function createRetryCondition(
  errorTypes: string[],
  statusCodes?: number[]
): (error: unknown, attempt: number) => boolean {
  return (error: unknown, attempt: number) => {
    if (isReynardError(error)) {
      // Check error code
      if (errorTypes.includes(error.code)) {
        return true;
      }

      // Check status code if available
      if (statusCodes && "status" in error.context && typeof error.context.status === "number") {
        return statusCodes.includes(error.context.status);
      }
    }

    return false;
  };
}

/**
 * Create retry condition for network errors only
 */
export function createNetworkRetryCondition(): (error: unknown, attempt: number) => boolean {
  return (error: unknown) => isNetworkError(error);
}

/**
 * Create retry condition for timeout errors only
 */
export function createTimeoutRetryCondition(): (error: unknown, attempt: number) => boolean {
  return (error: unknown) => isTimeoutError(error);
}

/**
 * Create retry condition for rate limit errors only
 */
export function createRateLimitRetryCondition(): (error: unknown, attempt: number) => boolean {
  return (error: unknown) => isRateLimitError(error);
}

// ============================================================================
// Retry Decorators
// ============================================================================

/**
 * Decorator for retrying async functions
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  config: RetryConfig = exponentialBackoffStrategy
): (fn: T) => T {
  return (fn: T) => {
    return (async (...args: Parameters<T>) => {
      const result = await retry(() => fn(...args), config);

      if (result.success) {
        return result.data;
      }

      throw result.error;
    }) as T;
  };
}

/**
 * Decorator for retrying with exponential backoff
 */
export function withExponentialBackoff<T extends (...args: any[]) => Promise<any>>(
  maxRetries: number = 3,
  baseDelay: number = 1000
): (fn: T) => T {
  return withRetry({
    ...exponentialBackoffStrategy,
    maxRetries,
    baseDelay,
  });
}

/**
 * Decorator for retrying with linear backoff
 */
export function withLinearBackoff<T extends (...args: any[]) => Promise<any>>(
  maxRetries: number = 3,
  baseDelay: number = 1000
): (fn: T) => T {
  return withRetry({
    ...linearBackoffStrategy,
    maxRetries,
    baseDelay,
  });
}

/**
 * Decorator for retrying with fixed delay
 */
export function withFixedDelay<T extends (...args: any[]) => Promise<any>>(
  maxRetries: number = 3,
  delay: number = 2000
): (fn: T) => T {
  return withRetry({
    ...fixedDelayStrategy,
    maxRetries,
    baseDelay: delay,
    maxDelay: delay,
  });
}

// ============================================================================
// Retry Monitoring
// ============================================================================

export interface RetryMetrics {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  averageRetryTime: number;
  retryReasons: Record<string, number>;
}

export class RetryMonitor {
  private metrics: RetryMetrics = {
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,
    averageRetryTime: 0,
    retryReasons: {},
  };

  recordAttempt(success: boolean, retryReason?: string, duration?: number): void {
    this.metrics.totalAttempts++;

    if (success) {
      this.metrics.successfulAttempts++;
    } else {
      this.metrics.failedAttempts++;
    }

    if (retryReason) {
      this.metrics.retryReasons[retryReason] = (this.metrics.retryReasons[retryReason] || 0) + 1;
    }

    if (duration !== undefined) {
      const totalTime = this.metrics.averageRetryTime * (this.metrics.totalAttempts - 1) + duration;
      this.metrics.averageRetryTime = totalTime / this.metrics.totalAttempts;
    }
  }

  getMetrics(): RetryMetrics {
    return { ...this.metrics };
  }

  reset(): void {
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
