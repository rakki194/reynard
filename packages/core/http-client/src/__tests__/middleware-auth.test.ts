/**
 * Auth Middleware Tests
 * Tests for authentication middleware functionality
 */

import { describe, it, expect, vi } from "vitest";
import { createAuthMiddleware } from "../middleware/auth";

describe("Auth Middleware", () => {
  describe("createAuthMiddleware", () => {
    it("should add Bearer token to headers", async () => {
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

    it("should add API key to headers", async () => {
      const middleware = createAuthMiddleware({
        apiKey: "api-key-123",
        type: "api-key",
        apiKeyHeader: "X-API-Key",
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: {},
      };

      const result = await middleware.request!(config);
      expect(result.headers?.["X-API-Key"]).toBe("api-key-123");
    });

    it("should use custom headers", async () => {
      const middleware = createAuthMiddleware({
        type: "custom",
        customHeaders: {
          "X-Custom-Auth": "custom-token",
        },
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: {},
      };

      const result = await middleware.request!(config);
      expect(result.headers?.["X-Custom-Auth"]).toBe("custom-token");
    });

    it("should preserve existing headers", async () => {
      const middleware = createAuthMiddleware({
        token: "test-token",
        type: "bearer",
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: {
          "Content-Type": "application/json",
          "X-Custom-Header": "custom-value",
        },
      };

      const result = await middleware.request!(config);
      expect(result.headers?.Authorization).toBe("Bearer test-token");
      expect(result.headers?.["Content-Type"]).toBe("application/json");
      expect(result.headers?.["X-Custom-Header"]).toBe("custom-value");
    });

    it("should handle basic authentication", async () => {
      const middleware = createAuthMiddleware({
        type: "basic",
        username: "testuser",
        password: "testpass",
      });

      const config = {
        method: "GET" as const,
        endpoint: "/test",
        headers: {},
      };

      const result = await middleware.request!(config);
      expect(result.headers?.Authorization).toBe("Basic dGVzdHVzZXI6dGVzdHBhc3M=");
    });
  });
});
