/**
 * Rate Limiting Middleware
 *
 * Provides request rate limiting with configurable requests per minute
 * and burst limit protection.
 */

import { HTTPMiddleware } from "../types";

export interface RateLimitConfig {
  requestsPerMinute: number;
  burstLimit?: number;
}

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(rateConfig: RateLimitConfig): HTTPMiddleware {
  const requests: number[] = [];
  const { requestsPerMinute, burstLimit = requestsPerMinute * 2 } = rateConfig;

  return {
    request: config => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      // Remove old requests
      while (requests.length > 0 && requests[0] < oneMinuteAgo) {
        requests.shift();
      }

      // Check rate limit
      if (requests.length >= requestsPerMinute) {
        const oldestRequest = requests[0];
        const waitTime = oldestRequest + 60000 - now;

        if (waitTime > 0) {
          throw new Error(`Rate limit exceeded. Wait ${waitTime}ms before retrying.`);
        }
      }

      // Check burst limit
      if (requests.length >= burstLimit) {
        throw new Error("Burst limit exceeded. Too many requests in a short time.");
      }

      requests.push(now);
      return config;
    },
  };
}
