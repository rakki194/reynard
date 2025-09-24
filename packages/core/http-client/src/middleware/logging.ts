/**
 * Logging Middleware
 *
 * Provides configurable logging for HTTP requests, responses, and errors.
 */

import { HTTPMiddleware } from "../types";

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
