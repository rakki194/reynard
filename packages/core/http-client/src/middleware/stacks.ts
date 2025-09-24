/**
 * Middleware Stacks
 *
 * Pre-configured middleware combinations for common use cases.
 */

import { AuthConfig } from "../types";
import { HTTPMiddleware } from "../middleware-types";
import { createAuthMiddleware } from "./auth";
import { createLoggingMiddleware, LoggingConfig } from "./logging";
import { createRateLimitMiddleware, RateLimitConfig } from "./rate-limiting";
import { createRequestIdMiddleware, createUserAgentMiddleware } from "./utils";

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
