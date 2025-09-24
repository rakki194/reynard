/**
 * Retry and Circuit Breaker Middleware
 *
 * Placeholder implementations for retry and circuit breaker functionality.
 * The actual retry logic is implemented in the HTTP client.
 */

import { HTTPMiddleware } from "../middleware-types";
import { RetryConfig, CircuitBreakerConfig } from "../types";

/**
 * Create retry middleware with custom retry logic
 */
export function createRetryMiddleware(_retryConfig: RetryConfig): HTTPMiddleware {
  return {
    error: error => {
      // This middleware would work with the client's retry logic
      // The actual retry implementation is in the client
      return error;
    },
  };
}

/**
 * Create circuit breaker middleware
 */
export function createCircuitBreakerMiddleware(_circuitConfig: CircuitBreakerConfig): HTTPMiddleware {
  return {
    error: error => {
      // Circuit breaker logic is implemented in the client
      // This middleware can add additional monitoring
      return error;
    },
  };
}
