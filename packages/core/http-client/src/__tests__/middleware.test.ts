/**
 * HTTP Middleware Tests
 * Tests for HTTP middleware functionality
 */

import { describe, it, expect, vi } from "vitest";
import {
  createAuthMiddleware,
  createLoggingMiddleware,
  createRetryMiddleware,
  createCircuitBreakerMiddleware,
} from "../middleware";

describe("HTTP Middleware", () => {
  describe("createAuthMiddleware", () => {
    it("should add authorization header", async () => {
      const middleware = createAuthMiddleware({
        token: "test-token",
        type: "bearer",
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: {},
      };

      const result = await middleware.request!(config);
      expect(result.headers?.Authorization).toBe("Bearer test-token");
    });
  });

  describe("createLoggingMiddleware", () => {
    it("should log requests and responses", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      const middleware = createLoggingMiddleware({
        logRequests: true,
        logResponses: true,
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: {},
      };

      await middleware.request!(config);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe("createRetryMiddleware", () => {
    it("should create retry middleware", () => {
      const middleware = createRetryMiddleware({
        maxRetries: 3,
        retryDelay: 1000,
      });

      expect(middleware).toBeDefined();
      expect(middleware.error).toBeDefined();
    });
  });

  describe("createCircuitBreakerMiddleware", () => {
    it("should create circuit breaker middleware", () => {
      const middleware = createCircuitBreakerMiddleware({
        failureThreshold: 5,
        recoveryTimeout: 30000,
      });

      expect(middleware).toBeDefined();
      expect(middleware.error).toBeDefined();
    });
  });
});
