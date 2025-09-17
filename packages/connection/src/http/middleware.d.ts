/**
 * HTTP Middleware System
 *
 * Middleware system for extending HTTP client functionality with authentication,
 * logging, retry logic, and custom business logic.
 */
import { HTTPRequestOptions, HTTPResponse, HTTPError, RetryConfig, CircuitBreakerConfig, HTTPMiddleware, AuthConfig, TokenRefreshConfig } from "./types";
export type { HTTPMiddleware, AuthConfig, TokenRefreshConfig } from "./types";
/**
 * Create authentication middleware
 */
export declare function createAuthMiddleware(authConfig: AuthConfig): HTTPMiddleware;
/**
 * Create token refresh middleware
 */
export declare function createTokenRefreshMiddleware(refreshConfig: TokenRefreshConfig): HTTPMiddleware;
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
export declare function createLoggingMiddleware(config?: LoggingConfig): HTTPMiddleware;
/**
 * Create retry middleware with custom retry logic
 */
export declare function createRetryMiddleware(retryConfig: RetryConfig): HTTPMiddleware;
/**
 * Create circuit breaker middleware
 */
export declare function createCircuitBreakerMiddleware(circuitConfig: CircuitBreakerConfig): HTTPMiddleware;
/**
 * Create request transformation middleware
 */
export declare function createRequestTransformMiddleware(transform: (config: HTTPRequestOptions) => HTTPRequestOptions): HTTPMiddleware;
/**
 * Create response transformation middleware
 */
export declare function createResponseTransformMiddleware<T, R>(transform: (response: HTTPResponse<T>) => HTTPResponse<R>): HTTPMiddleware;
export interface CacheConfig {
    ttl?: number;
    maxSize?: number;
    keyGenerator?: (config: HTTPRequestOptions) => string;
}
/**
 * Create caching middleware
 */
export declare function createCacheMiddleware(cacheConfig?: CacheConfig): HTTPMiddleware;
export interface RateLimitConfig {
    requestsPerMinute: number;
    burstLimit?: number;
}
/**
 * Create rate limiting middleware
 */
export declare function createRateLimitMiddleware(rateConfig: RateLimitConfig): HTTPMiddleware;
/**
 * Create error handling middleware
 */
export declare function createErrorHandlingMiddleware(errorHandler: (error: HTTPError) => void | Promise<void>): HTTPMiddleware;
/**
 * Create request ID middleware
 */
export declare function createRequestIdMiddleware(): HTTPMiddleware;
/**
 * Create user agent middleware
 */
export declare function createUserAgentMiddleware(userAgent: string): HTTPMiddleware;
/**
 * Create standard API middleware stack
 */
export declare function createApiMiddlewareStack(options: {
    auth?: AuthConfig;
    logging?: LoggingConfig;
    rateLimit?: RateLimitConfig;
}): HTTPMiddleware[];
/**
 * Create upload middleware stack
 */
export declare function createUploadMiddlewareStack(options: {
    auth?: AuthConfig;
    logging?: LoggingConfig;
}): HTTPMiddleware[];
