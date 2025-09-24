/**
 * HTTP Middleware System
 *
 * Main entry point for HTTP middleware functionality.
 * Re-exports all middleware types and factory functions.
 */

// Re-export types
export type { HTTPMiddleware } from "./middleware-types";
export type { AuthConfig, TokenRefreshConfig } from "./types";

// Re-export authentication middleware
export { createAuthMiddleware, createTokenRefreshMiddleware } from "./middleware/auth";

// Re-export logging middleware
export { createLoggingMiddleware, type LoggingConfig } from "./middleware/logging";

// Re-export caching middleware
export { createCacheMiddleware, type CacheConfig } from "./middleware/caching";

// Re-export rate limiting middleware
export { createRateLimitMiddleware, type RateLimitConfig } from "./middleware/rate-limiting";

// Re-export utility middleware
export {
  createRequestTransformMiddleware,
  createResponseTransformMiddleware,
  createErrorHandlingMiddleware,
  createRequestIdMiddleware,
  createUserAgentMiddleware,
} from "./middleware/utils";

// Re-export middleware stacks
export { createApiMiddlewareStack, createUploadMiddlewareStack } from "./middleware/stacks";

// Re-export retry and circuit breaker middleware (placeholder implementations)
export { createRetryMiddleware, createCircuitBreakerMiddleware } from "./middleware/retry";
