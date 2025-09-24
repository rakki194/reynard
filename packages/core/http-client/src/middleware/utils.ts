/**
 * Utility Middleware
 *
 * Common utility middleware for request/response transformation,
 * error handling, request ID generation, and user agent setting.
 */

import { HTTPRequestOptions, HTTPResponse, HTTPError, HTTPMiddleware } from "../types";

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
