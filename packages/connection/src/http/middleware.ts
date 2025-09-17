/**
 * HTTP Middleware System
 *
 * Middleware system for extending HTTP client functionality with authentication,
 * logging, retry logic, and custom business logic.
 */

import {
  HTTPRequestOptions,
  HTTPResponse,
  HTTPError,
  RetryConfig,
  CircuitBreakerConfig,
  HTTPMiddleware,
  AuthConfig,
  TokenRefreshConfig,
} from "./types";

// Re-export types that are used in this module
export type { HTTPMiddleware, AuthConfig, TokenRefreshConfig } from "./types";

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Create authentication middleware
 */
export function createAuthMiddleware(authConfig: AuthConfig): HTTPMiddleware {
  return {
    request: config => {
      const headers = { ...config.headers };

      switch (authConfig.type) {
        case "bearer":
          if (authConfig.token) {
            headers.Authorization = `Bearer ${authConfig.token}`;
          }
          break;

        case "basic":
          if (authConfig.username && authConfig.password) {
            const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
            headers.Authorization = `Basic ${credentials}`;
          }
          break;

        case "api-key":
          if (authConfig.apiKey) {
            const headerName = authConfig.apiKeyHeader || "X-API-Key";
            headers[headerName] = authConfig.apiKey;
          }
          break;

        case "custom":
          if (authConfig.customHeaders) {
            Object.assign(headers, authConfig.customHeaders);
          }
          break;
      }

      return { ...config, headers };
    },
  };
}

/**
 * Create token refresh middleware
 */
export function createTokenRefreshMiddleware(refreshConfig: TokenRefreshConfig): HTTPMiddleware {
  let isRefreshing = false;
  let refreshPromise: Promise<string> | null = null;

  return {
    request: async config => {
      // If we're already refreshing, wait for it
      if (isRefreshing && refreshPromise) {
        try {
          const newToken = await refreshPromise;
          return {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
        } catch (error) {
          refreshConfig.onTokenExpired();
          throw error;
        }
      }

      return config;
    },

    error: async error => {
      // Check if it's an authentication error
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken(refreshConfig);

        try {
          const newToken = await refreshPromise;
          refreshConfig.onTokenRefresh(newToken);

          // Retry the original request with new token
          // This would need to be handled by the client
          return error;
        } catch (refreshError) {
          refreshConfig.onTokenExpired();
          throw refreshError;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }

      return error;
    },
  };
}

async function refreshToken(config: TokenRefreshConfig): Promise<string> {
  const response = await fetch(config.refreshEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: config.refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  return data.accessToken || data.token;
}

// ============================================================================
// Logging Middleware
// ============================================================================

export interface LoggingConfig {
  logRequests?: boolean;
  logResponses?: boolean;
  logErrors?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
  logger?: (level: string, message: string, data?: unknown) => void;
}

/**
 * Create logging middleware
 */
export function createLoggingMiddleware(config: LoggingConfig = {}): HTTPMiddleware {
  const { logRequests = true, logResponses = true, logErrors = true, logLevel = "info", logger = console.log } = config;

  return {
    request: config => {
      if (logRequests) {
        logger(logLevel, "HTTP Request", {
          method: config.method,
          endpoint: config.endpoint,
          headers: config.headers,
          data: config.data,
        });
      }
      return config;
    },

    response: response => {
      if (logResponses) {
        logger(logLevel, "HTTP Response", {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          requestTime: response.requestTime,
        });
      }
      return response;
    },

    error: error => {
      if (logErrors) {
        logger("error", "HTTP Error", {
          message: error.message,
          status: error.status,
          config: error.config,
          requestTime: error.requestTime,
          retryCount: error.retryCount,
        });
      }
      return error;
    },
  };
}

// ============================================================================
// Retry Middleware
// ============================================================================

/**
 * Create retry middleware with custom retry logic
 */
export function createRetryMiddleware(retryConfig: RetryConfig): HTTPMiddleware {
  return {
    error: error => {
      // This middleware would work with the client's retry logic
      // The actual retry implementation is in the client
      return error;
    },
  };
}

// ============================================================================
// Circuit Breaker Middleware
// ============================================================================

/**
 * Create circuit breaker middleware
 */
export function createCircuitBreakerMiddleware(circuitConfig: CircuitBreakerConfig): HTTPMiddleware {
  return {
    error: error => {
      // Circuit breaker logic is implemented in the client
      // This middleware can add additional monitoring
      return error;
    },
  };
}

// ============================================================================
// Request/Response Transformation Middleware
// ============================================================================

/**
 * Create request transformation middleware
 */
export function createRequestTransformMiddleware(
  transform: (config: HTTPRequestOptions) => HTTPRequestOptions
): HTTPMiddleware {
  return {
    request: transform,
  };
}

/**
 * Create response transformation middleware
 */
export function createResponseTransformMiddleware<T, R>(
  transform: (response: HTTPResponse<T>) => HTTPResponse<R>
): HTTPMiddleware {
  return {
    response: response => transform(response as HTTPResponse<T>),
  };
}

// ============================================================================
// Caching Middleware
// ============================================================================

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

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

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

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Create error handling middleware
 */
export function createErrorHandlingMiddleware(
  errorHandler: (error: HTTPError) => void | Promise<void>
): HTTPMiddleware {
  return {
    error: async error => {
      await errorHandler(error);
      return error;
    },
  };
}

// ============================================================================
// Request ID Middleware
// ============================================================================

/**
 * Create request ID middleware
 */
export function createRequestIdMiddleware(): HTTPMiddleware {
  return {
    request: config => {
      const requestId = crypto.randomUUID();
      return {
        ...config,
        headers: {
          ...config.headers,
          "X-Request-ID": requestId,
        },
      };
    },
  };
}

// ============================================================================
// User Agent Middleware
// ============================================================================

/**
 * Create user agent middleware
 */
export function createUserAgentMiddleware(userAgent: string): HTTPMiddleware {
  return {
    request: config => {
      return {
        ...config,
        headers: {
          ...config.headers,
          "User-Agent": userAgent,
        },
      };
    },
  };
}

// ============================================================================
// Common Middleware Combinations
// ============================================================================

/**
 * Create standard API middleware stack
 */
export function createApiMiddlewareStack(options: {
  auth?: AuthConfig;
  logging?: LoggingConfig;
  rateLimit?: RateLimitConfig;
}): HTTPMiddleware[] {
  const middleware: HTTPMiddleware[] = [];

  // Add request ID
  middleware.push(createRequestIdMiddleware());

  // Add user agent
  middleware.push(createUserAgentMiddleware("Reynard-HTTP-Client/1.0"));

  // Add authentication
  if (options.auth) {
    middleware.push(createAuthMiddleware(options.auth));
  }

  // Add logging
  if (options.logging) {
    middleware.push(createLoggingMiddleware(options.logging));
  }

  // Add rate limiting
  if (options.rateLimit) {
    middleware.push(createRateLimitMiddleware(options.rateLimit));
  }

  return middleware;
}

/**
 * Create upload middleware stack
 */
export function createUploadMiddlewareStack(options: { auth?: AuthConfig; logging?: LoggingConfig }): HTTPMiddleware[] {
  const middleware: HTTPMiddleware[] = [];

  // Add request ID
  middleware.push(createRequestIdMiddleware());

  // Add authentication
  if (options.auth) {
    middleware.push(createAuthMiddleware(options.auth));
  }

  // Add logging (without request data for large uploads)
  if (options.logging) {
    middleware.push(
      createLoggingMiddleware({
        ...options.logging,
        logRequests: false, // Don't log large request bodies
      })
    );
  }

  return middleware;
}
