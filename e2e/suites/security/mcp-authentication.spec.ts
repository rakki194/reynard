/**
 * 🦊 Fenrir MCP Authentication E2E Security Tests
 * ================================================
 *
 * Comprehensive end-to-end security testing for MCP (Model Context Protocol)
 * authentication system, including MCP server security, FastAPI backend integration,
 * and complete authentication flow validation.
 *
 * This test suite ensures:
 * - MCP server is not publicly accessible without proper authentication
 * - JWT token validation and permission checking works correctly
 * - Rate limiting and abuse prevention mechanisms are effective
 * - End-to-end authentication flow between MCP and FastAPI backend is secure
 * - Token expiration and refresh mechanisms work properly
 * - Client type validation and permission-based access control functions correctly
 *
 * Author: Odonata-Oracle-6 (Dragonfly Specialist)
 * Version: 1.0.0
 */

import { test, expect, Page, BrowserContext } from "@playwright/test";
import { MCPAuthTestSuite } from "../../modules/security/mcp-auth-test-suite";
import { SecurityTestUtils } from "../../modules/security/security-test-utils";

test.describe("🦊 Fenrir MCP Authentication Security", () => {
  let testSuite: MCPAuthTestSuite;
  let securityUtils: SecurityTestUtils;
  let testClientId: string;
  let testClientSecret: string;

  test.beforeAll(async () => {
    testSuite = new MCPAuthTestSuite();
    securityUtils = new SecurityTestUtils();
    testClientId = "test-mcp-client-e2e";
    testClientSecret = "test-secret-key-2025-e2e";

    // Set up test environment
    await testSuite.setupTestEnvironment(testClientId, testClientSecret);
  });

  test.afterAll(async () => {
    // Clean up test environment
    await testSuite.cleanupTestEnvironment(testClientId);
  });

  test.describe("🔒 MCP Server Security", () => {
    test("should reject unauthenticated requests", async ({ request }) => {
      const response = await request.get("/api/mcp/tools/list");

      expect(response.status()).toBe(401);
      expect(await response.text()).toContain("unauthorized");
    });

    test("should reject requests with invalid tokens", async ({ request }) => {
      const response = await request.get("/api/mcp/tools/list", {
        headers: {
          Authorization: "Bearer invalid-token-12345",
        },
      });

      expect(response.status()).toBe(401);
      expect(await response.text()).toContain("invalid");
    });

    test("should reject requests with expired tokens", async ({ request }) => {
      const expiredToken = await securityUtils.generateExpiredToken(testClientId);

      const response = await request.get("/api/mcp/tools/list", {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      expect(response.status()).toBe(401);
      expect(await response.text()).toContain("expired");
    });

    test("should validate permissions correctly", async ({ request }) => {
      // Create token with limited permissions
      const limitedToken = await securityUtils.generateTokenWithPermissions(testClientId, ["mcp:read"]);

      // Test read operation (should succeed)
      const readResponse = await request.get("/api/mcp/tools/list", {
        headers: {
          Authorization: `Bearer ${limitedToken}`,
        },
      });

      expect(readResponse.status()).toBe(200);

      // Test write operation (should fail)
      const writeResponse = await request.post("/api/mcp/tools/execute", {
        headers: {
          Authorization: `Bearer ${limitedToken}`,
        },
        data: {
          tool: "test_tool",
          params: {},
        },
      });

      expect(writeResponse.status()).toBe(403);
    });

    test("should block unauthorized tool access", async ({ request }) => {
      const token = await testSuite.getValidToken(testClientId);

      const response = await request.post("/api/mcp/tools/execute", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          tool: "admin_tool",
          params: { action: "delete_all_data" },
        },
      });

      expect(response.status()).toBe(403);
    });
  });

  test.describe("🔗 FastAPI Backend Integration", () => {
    test("should handle bootstrap authentication flow", async ({ request }) => {
      const bootstrapData = {
        client_id: testClientId,
        client_secret: testClientSecret,
        client_type: "agent",
        permissions: ["mcp:read", "mcp:write"],
      };

      const response = await request.post("/api/mcp/bootstrap", {
        data: bootstrapData,
      });

      expect(response.status()).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(result).toHaveProperty("expires_in");
    });

    test("should reject invalid bootstrap credentials", async ({ request }) => {
      const invalidData = {
        client_id: "invalid-client",
        client_secret: "invalid-secret",
        client_type: "agent",
        permissions: ["mcp:read"],
      };

      const response = await request.post("/api/mcp/bootstrap", {
        data: invalidData,
      });

      expect(response.status()).toBe(401);
    });

    test("should handle token refresh mechanism", async ({ request }) => {
      // First, get a valid token
      const bootstrapData = {
        client_id: testClientId,
        client_secret: testClientSecret,
        client_type: "agent",
        permissions: ["mcp:read"],
      };

      const bootstrapResponse = await request.post("/api/mcp/bootstrap", {
        data: bootstrapData,
      });

      expect(bootstrapResponse.status()).toBe(200);

      const bootstrapResult = await bootstrapResponse.json();
      const refreshToken = bootstrapResult.refresh_token;

      // Test refresh request
      const refreshResponse = await request.post("/api/mcp/refresh", {
        data: { refresh_token: refreshToken },
      });

      expect(refreshResponse.status()).toBe(200);

      const refreshResult = await refreshResponse.json();
      expect(refreshResult).toHaveProperty("access_token");
    });

    test("should validate client types correctly", async ({ request }) => {
      const invalidClientTypeData = {
        client_id: testClientId,
        client_secret: testClientSecret,
        client_type: "invalid_type",
        permissions: ["mcp:read"],
      };

      const response = await request.post("/api/mcp/bootstrap", {
        data: invalidClientTypeData,
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe("🛡️ Rate Limiting and Abuse Prevention", () => {
    test("should implement authentication rate limiting", async ({ request }) => {
      const promises = [];

      // Make multiple rapid authentication requests
      for (let i = 0; i < 10; i++) {
        const invalidData = {
          client_id: `test-client-${i}`,
          client_secret: "invalid-secret",
          client_type: "agent",
          permissions: ["mcp:read"],
        };

        promises.push(
          request.post("/api/mcp/bootstrap", {
            data: invalidData,
          })
        );
      }

      const responses = await Promise.all(promises);

      // At least some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test("should implement brute force protection", async ({ request }) => {
      let blockedAttempts = 0;

      // Try multiple authentication attempts with same credentials
      for (let i = 0; i < 5; i++) {
        const invalidData = {
          client_id: testClientId,
          client_secret: "wrong-password",
          client_type: "agent",
          permissions: ["mcp:read"],
        };

        const response = await request.post("/api/mcp/bootstrap", {
          data: invalidData,
        });

        if (response.status() === 429 || response.status() === 423) {
          blockedAttempts++;
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      expect(blockedAttempts).toBeGreaterThan(0);
    });

    test("should implement request throttling", async ({ request }) => {
      const token = await testSuite.getValidToken(testClientId);
      const headers = { Authorization: `Bearer ${token}` };

      const promises = [];

      // Make many rapid requests with valid token
      for (let i = 0; i < 20; i++) {
        promises.push(request.get("/api/mcp/tools/list", { headers }));
      }

      const responses = await Promise.all(promises);

      // Some requests should be throttled
      const throttledResponses = responses.filter(r => r.status() === 429);
      expect(throttledResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe("🔄 End-to-End Authentication Flow", () => {
    test("should complete MCP to backend authentication flow", async ({ request }) => {
      // Step 1: Bootstrap authentication with FastAPI backend
      const bootstrapData = {
        client_id: testClientId,
        client_secret: testClientSecret,
        client_type: "agent",
        permissions: ["mcp:read", "mcp:write", "mcp:admin"],
      };

      const bootstrapResponse = await request.post("/api/mcp/bootstrap", {
        data: bootstrapData,
      });

      expect(bootstrapResponse.status()).toBe(200);

      const bootstrapResult = await bootstrapResponse.json();
      const accessToken = bootstrapResult.access_token;

      // Step 2: Use token to access MCP server
      const mcpResponse = await request.get("/api/mcp/tools/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(mcpResponse.status()).toBe(200);

      // Step 3: Use token to access FastAPI backend endpoints
      const backendResponse = await request.get("/api/mcp/status", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(backendResponse.status()).toBe(200);

      // Step 4: Test token expiration handling
      const expiringToken = await securityUtils.generateExpiringToken(testClientId, 1);

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to use expired token
      const expiredResponse = await request.get("/api/mcp/tools/list", {
        headers: { Authorization: `Bearer ${expiringToken}` },
      });

      expect(expiredResponse.status()).toBe(401);
    });

    test("should validate tokens across services", async ({ request }) => {
      // Get token from FastAPI backend
      const bootstrapData = {
        client_id: testClientId,
        client_secret: testClientSecret,
        client_type: "agent",
        permissions: ["mcp:read", "mcp:write"],
      };

      const response = await request.post("/api/mcp/bootstrap", {
        data: bootstrapData,
      });

      expect(response.status()).toBe(200);

      const token = (await response.json()).access_token;
      const headers = { Authorization: `Bearer ${token}` };

      // Test token on both services
      const mcpResult = await request.get("/api/mcp/tools/list", { headers });
      const backendResult = await request.get("/api/mcp/status", { headers });

      expect(mcpResult.status()).toBe(200);
      expect(backendResult.status()).toBe(200);
    });

    test("should handle concurrent authentication requests", async ({ request }) => {
      const promises = [];

      // Make multiple concurrent bootstrap requests
      for (let i = 0; i < 5; i++) {
        const bootstrapData = {
          client_id: `${testClientId}-${i}`,
          client_secret: testClientSecret,
          client_type: "agent",
          permissions: ["mcp:read"],
        };

        promises.push(
          request.post("/api/mcp/bootstrap", {
            data: bootstrapData,
          })
        );
      }

      const responses = await Promise.all(promises);

      // All requests should succeed (or be properly handled)
      responses.forEach(response => {
        expect([200, 401, 429]).toContain(response.status());
      });
    });

    test("should maintain session state correctly", async ({ request }) => {
      // Get initial token
      const bootstrapData = {
        client_id: testClientId,
        client_secret: testClientSecret,
        client_type: "agent",
        permissions: ["mcp:read"],
      };

      const bootstrapResponse = await request.post("/api/mcp/bootstrap", {
        data: bootstrapData,
      });

      expect(bootstrapResponse.status()).toBe(200);

      const token = (await bootstrapResponse.json()).access_token;
      const headers = { Authorization: `Bearer ${token}` };

      // Make multiple requests with same token
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(request.get("/api/mcp/tools/list", { headers }));
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test.describe("🔐 Advanced Security Features", () => {
    test("should validate JWT signature correctly", async ({ request }) => {
      // Create token with wrong signature
      const invalidSignatureToken = await securityUtils.generateTokenWithInvalidSignature(testClientId);

      const response = await request.get("/api/mcp/tools/list", {
        headers: {
          Authorization: `Bearer ${invalidSignatureToken}`,
        },
      });

      expect(response.status()).toBe(401);
    });

    test("should handle malformed JWT tokens", async ({ request }) => {
      const malformedTokens = [
        "not-a-jwt-token",
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.malformed",
        "Bearer token",
        "",
        null,
      ];

      for (const token of malformedTokens) {
        const response = await request.get("/api/mcp/tools/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status()).toBe(401);
      }
    });

    test("should implement proper CORS headers", async ({ request }) => {
      const response = await request.options("/api/mcp/tools/list");

      expect(response.headers()["access-control-allow-origin"]).toBeDefined();
      expect(response.headers()["access-control-allow-methods"]).toBeDefined();
      expect(response.headers()["access-control-allow-headers"]).toBeDefined();
    });

    test("should implement security headers", async ({ request }) => {
      const response = await request.get("/api/mcp/tools/list");

      expect(response.headers()["x-content-type-options"]).toBe("nosniff");
      expect(response.headers()["x-frame-options"]).toBeDefined();
      expect(response.headers()["x-xss-protection"]).toBeDefined();
    });

    test("should handle token revocation", async ({ request }) => {
      // Get a valid token
      const token = await testSuite.getValidToken(testClientId);

      // Revoke the token
      const revokeResponse = await request.post("/api/mcp/revoke", {
        headers: { Authorization: `Bearer ${token}` },
        data: { token },
      });

      expect(revokeResponse.status()).toBe(200);

      // Try to use revoked token
      const revokedResponse = await request.get("/api/mcp/tools/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(revokedResponse.status()).toBe(401);
    });
  });

  test.describe("📊 Performance and Load Testing", () => {
    test("should handle high load authentication requests", async ({ request }) => {
      const startTime = Date.now();
      const promises = [];

      // Make 50 concurrent authentication requests
      for (let i = 0; i < 50; i++) {
        const bootstrapData = {
          client_id: `${testClientId}-load-${i}`,
          client_secret: testClientSecret,
          client_type: "agent",
          permissions: ["mcp:read"],
        };

        promises.push(
          request.post("/api/mcp/bootstrap", {
            data: bootstrapData,
          })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);

      // Most requests should succeed
      const successfulResponses = responses.filter(r => r.status() === 200);
      expect(successfulResponses.length).toBeGreaterThan(40);
    });

    test("should maintain performance under sustained load", async ({ request }) => {
      const token = await testSuite.getValidToken(testClientId);
      const headers = { Authorization: `Bearer ${token}` };

      const startTime = Date.now();
      const promises = [];

      // Make 100 requests over time
      for (let i = 0; i < 100; i++) {
        promises.push(request.get("/api/mcp/tools/list", { headers }));

        // Small delay to simulate sustained load
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (10 seconds)
      expect(duration).toBeLessThan(10000);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });
});
