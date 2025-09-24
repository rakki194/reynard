/**
 * HTTP System for Reynard Framework
 *
 * Comprehensive HTTP client system with middleware support, retry logic,
 * error handling, and authentication. This system provides a single
 * source of truth for all HTTP operations across Reynard packages.
 */

export * from "./client";
export * from "./client-core";
export * from "./types";
export * from "./presets";
export * from "./utility-types";
export * from "./middleware-types";

// Re-export middleware with specific exports to avoid conflicts
export type { HTTPMiddleware } from "./middleware-types";
export * from "./middleware";

// Re-export specific classes to avoid naming conflicts
export { CircuitBreaker } from "./circuit-breaker";
export { RetryHandler } from "./retry-handler";
export { MetricsTracker } from "./metrics-tracker";
export { MiddlewareManager } from "./middleware-manager";
export { HTTPMethods } from "./http-methods";
export { RequestExecutor } from "./request-executor";
export { ConfigManager } from "./config-manager";
export { RequestHandler } from "./request-handler";
