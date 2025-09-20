/**
 * Tests for the useMCP composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useMCP } from "../../composables/useMCP";
import type { ReynardApiClient } from "../../client";

// Mock the client
const mockClient = {
  config: {
    basePath: "http://localhost:8000",
  },
} as ReynardApiClient;

describe("useMCP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("generateToken", () => {
    it("should generate an MCP token", async () => {
      const mockRequest = {
        client_id: "test-client",
        additional_permissions: ["mcp:admin"],
      };

      const mockResponse = {
        token: "jwt-token-123",
        client_id: "test-client",
        permissions: ["mcp:admin", "mcp:read"],
        expires_at: 1640995200,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mcpService = useMCP(mockClient);
      const result = await mcpService.generateToken(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/mcp/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mockRequest),
        })
      );
    });

    it("should generate token without additional permissions", async () => {
      const mockRequest = {
        client_id: "test-client",
      };

      const mockResponse = {
        token: "jwt-token-456",
        client_id: "test-client",
        permissions: ["mcp:read"],
        expires_at: 1640995200,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mcpService = useMCP(mockClient);
      const result = await mcpService.generateToken(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/mcp/token",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(mockRequest),
        })
      );
    });
  });

  describe("listClients", () => {
    it("should list all MCP clients", async () => {
      const mockResponse = [
        {
          client_id: "client-1",
          client_type: "web",
          name: "Web Client",
          permissions: ["mcp:read"],
          is_active: true,
          created_at: "2025-01-15T10:00:00Z",
          last_used: "2025-01-15T12:00:00Z",
        },
        {
          client_id: "client-2",
          client_type: "mobile",
          name: "Mobile App",
          permissions: ["mcp:read", "mcp:write"],
          is_active: false,
          created_at: "2025-01-14T10:00:00Z",
          last_used: null,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mcpService = useMCP(mockClient);
      const result = await mcpService.listClients();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/mcp/clients");
    });
  });

  describe("getClientInfo", () => {
    it("should get specific client information", async () => {
      const clientId = "client-123";
      const mockResponse = {
        client_id: clientId,
        client_type: "desktop",
        name: "Desktop App",
        permissions: ["mcp:admin"],
        is_active: true,
        created_at: "2025-01-15T10:00:00Z",
        last_used: "2025-01-15T14:00:00Z",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mcpService = useMCP(mockClient);
      const result = await mcpService.getClientInfo(clientId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(`http://localhost:8000/mcp/client/${clientId}`);
    });
  });

  describe("getStats", () => {
    it("should get MCP system statistics", async () => {
      const mockResponse = {
        total_clients: 5,
        active_clients: 3,
        client_types: {
          web: 2,
          mobile: 2,
          desktop: 1,
        },
        permissions: ["mcp:read", "mcp:write", "mcp:admin"],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mcpService = useMCP(mockClient);
      const result = await mcpService.getStats();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/mcp/stats");
    });
  });

  describe("validateToken", () => {
    it("should validate MCP token", async () => {
      const mockResponse = {
        valid: true,
        client_id: "client-123",
        client_type: "web",
        permissions: ["mcp:read", "mcp:write"],
        expires_at: 1640995200,
        client_name: "Test Client",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mcpService = useMCP(mockClient);
      const result = await mcpService.validateToken();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/mcp/validate");
    });

    it("should handle invalid token", async () => {
      const mockResponse = {
        valid: false,
        client_id: null,
        client_type: null,
        permissions: [],
        expires_at: 0,
        client_name: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mcpService = useMCP(mockClient);
      const result = await mcpService.validateToken();

      expect(result).toEqual(mockResponse);
      expect(result.valid).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should handle HTTP errors", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const mcpService = useMCP(mockClient);

      await expect(
        mcpService.generateToken({
          client_id: "test-client",
        })
      ).rejects.toThrow("HTTP error! status: 401");
    });

    it("should handle network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const mcpService = useMCP(mockClient);

      try {
        await mcpService.listClients();
      } catch (error) {
        // Expected to throw
      }

      expect(mcpService.error()).toBe("Network error");
    });

    it("should set loading state during operations", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      const mcpService = useMCP(mockClient);

      // Start the operation
      const operationPromise = mcpService.getStats();

      // Check loading state
      expect(mcpService.loading()).toBe(true);

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () =>
          Promise.resolve({
            total_clients: 0,
            active_clients: 0,
            client_types: {},
            permissions: [],
          }),
      });

      await operationPromise;
      expect(mcpService.loading()).toBe(false);
    });
  });
});
