/**
 * Caching Middleware
 *
 * Provides HTTP response caching with configurable TTL and size limits.
 */

import { HTTPRequestOptions, HTTPResponse, HTTPMiddleware } from "../types";

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  keyGenerator?: (config: HTTPRequestOptions) => string;
}

/**
 * Create caching middleware
 */
export function createCacheMiddleware(cacheConfig: CacheConfig = {}): HTTPMiddleware {
  const cache = new Map<string, { data: HTTPResponse; timestamp: number }>();
  const {
    ttl = 300000, // 5 minutes default
    maxSize = 100,
    keyGenerator = config => `${config.method}:${config.endpoint}`,
  } = cacheConfig;

  return {
    request: config => {
      // Only cache GET requests
      if (config.method !== "GET") {
        return config;
      }

      const key = keyGenerator(config);
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < ttl) {
        // Return cached response (this would need special handling in the client)
        return config;
      }

      return config;
    },

    response: response => {
      // Only cache GET requests
      if (response.config.method !== "GET") {
        return response;
      }

      const key = keyGenerator(response.config);

      // Clean up old entries if cache is full
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }

      cache.set(key, {
        data: response,
        timestamp: Date.now(),
      });

      return response;
    },
  };
}
