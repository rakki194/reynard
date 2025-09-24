/**
 * Retry Handler Implementation
 *
 * Handles retry logic with exponential backoff and jitter,
 * along with comprehensive error handling.
 */

import { HTTPError, HTTPRequestOptions } from "./types";

export interface RetryConfig {
  maxRetries: number;
  enabled: boolean;
  baseDelay: number;
  maxDelay: number;
  jitterFactor: number;
}

export interface RetryMetrics {
  attemptCount: number;
  totalRetries: number;
  lastRetryDelay: number;
}

export class RetryHandler {
  private config: Required<RetryConfig>;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      enabled: config.enabled ?? true,
      baseDelay: config.baseDelay ?? 1000, // 1 second
      maxDelay: config.maxDelay ?? 30000, // 30 seconds
      jitterFactor: config.jitterFactor ?? 0.1, // 10% jitter
    };
  }

  /**
   * Check if an error should trigger a retry
   */
  shouldRetry(error: HTTPError): boolean {
    if (!this.config.enabled) return false;

    // Retry on network errors or 5xx status codes
    return (
      error.status === 0 || // Network error
      (error.status !== undefined && error.status >= 500 && error.status < 600) || // Server errors
      error.status === 429 // Rate limiting
    );
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  calculateRetryDelay(attempt: number): number {
    const delay = Math.min(
      this.config.baseDelay * Math.pow(2, attempt),
      this.config.maxDelay
    );
    const jitter = Math.random() * this.config.jitterFactor * delay;
    return delay + jitter;
  }

  /**
   * Wait for the specified delay
   */
  async waitForRetry(delay: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Create a standardized HTTP error
   */
  createError(
    message: string,
    config: HTTPRequestOptions,
    status = 0,
    startTime: number,
    requestTime?: number,
    retryCount = 0
  ): HTTPError {
    const error = new Error(message) as HTTPError;
    error.status = status;
    error.config = config;
    error.requestTime = requestTime;
    error.retryCount = retryCount;
    return error;
  }

  /**
   * Get retry configuration
   */
  getConfig(): Required<RetryConfig> {
    return { ...this.config };
  }

  /**
   * Update retry configuration
   */
  updateConfig(newConfig: Partial<RetryConfig>): void {
    Object.assign(this.config, newConfig);
  }
}
