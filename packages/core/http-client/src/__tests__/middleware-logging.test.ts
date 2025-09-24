/**
 * Logging Middleware Tests
 * Tests for logging middleware functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLoggingMiddleware } from "../middleware/logging";

describe("Logging Middleware", () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("createLoggingMiddleware", () => {
    it("should log requests when enabled", async () => {
      const middleware = createLoggingMiddleware({
        logRequests: true,
        logResponses: false,
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: { "Content-Type": "application/json" },
      };

      await middleware.request!(config);
      expect(consoleSpy).toHaveBeenCalledWith(
        "info",
        "HTTP Request",
        expect.objectContaining({
          method: "GET",
          endpoint: "/test",
        })
      );
    });

    it("should log responses when enabled", async () => {
      const middleware = createLoggingMiddleware({
        logRequests: false,
        logResponses: true,
      });

      const response = {
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
        config: { method: "GET", endpoint: "/test" },
        requestTime: 150,
      };

      await middleware.response!(response);
      expect(consoleSpy).toHaveBeenCalledWith(
        "info",
        "HTTP Response",
        expect.objectContaining({
          status: 200,
          requestTime: 150,
        })
      );
    });

    it("should log errors when enabled", async () => {
      const middleware = createLoggingMiddleware({
        logRequests: false,
        logResponses: false,
        logErrors: true,
      });

      const error = {
        message: "Network error",
        status: 0,
        config: { method: "GET", endpoint: "/test" },
        requestTime: 100,
        retryCount: 0,
      };

      await middleware.error!(error);
      expect(consoleSpy).toHaveBeenCalledWith(
        "error",
        "HTTP Error",
        expect.objectContaining({
          message: "Network error",
          status: 0,
        })
      );
    });

    it("should not log when disabled", async () => {
      const middleware = createLoggingMiddleware({
        logRequests: false,
        logResponses: false,
        logErrors: false,
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: {},
      };

      await middleware.request!(config);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should use custom logger function", async () => {
      const customLogger = vi.fn();
      const middleware = createLoggingMiddleware({
        logRequests: true,
        logResponses: false,
        logger: customLogger,
      });

      const config = {
        method: "POST" as const,
        endpoint: "/users",
        headers: { "Content-Type": "application/json" },
        data: { name: "test" },
      };

      await middleware.request!(config);
      expect(customLogger).toHaveBeenCalledWith(
        "info",
        "HTTP Request",
        expect.objectContaining({
          method: "POST",
          endpoint: "/users",
        })
      );
    });

    it("should include request data in logs by default", async () => {
      const middleware = createLoggingMiddleware({
        logRequests: true,
        logResponses: false,
      });

      const config = {
        method: "POST" as const,
        endpoint: "/users",
        headers: { "Content-Type": "application/json" },
        data: { name: "test", email: "test@example.com" },
      };

      await middleware.request!(config);
      expect(consoleSpy).toHaveBeenCalledWith(
        "info",
        "HTTP Request",
        expect.objectContaining({
          data: { name: "test", email: "test@example.com" },
        })
      );
    });
  });
});
