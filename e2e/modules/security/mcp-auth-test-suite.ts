/**
 * 🦊 MCP Authentication Test Suite
 * ================================
 *
 * Comprehensive test utilities for MCP authentication security testing,
 * including token generation, validation, and test environment management.
 *
 * Author: Odonata-Oracle-6 (Dragonfly Specialist)
 * Version: 1.0.0
 */

import jwt from "jsonwebtoken";
import { request } from "@playwright/test";

export interface MCPClient {
  client_id: string;
  client_type: "agent" | "tool" | "user";
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

export interface MCPTokenData {
  client_id: string;
  client_type: string;
  permissions: string[];
  issued_at: number;
  expires_at: number;
  scope: string;
}

export interface BootstrapResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class MCPAuthTestSuite {
  private mcpServerUrl: string;
  private fastApiBackendUrl: string;
  private testClients: Map<string, MCPClient> = new Map();
  private jwtSecret: string;

  constructor() {
    this.mcpServerUrl = process.env.MCP_SERVER_URL || "http://localhost:8001";
    this.fastApiBackendUrl = process.env.FASTAPI_BACKEND_URL || "http://localhost:8000";
    this.jwtSecret = process.env.MCP_TOKEN_SECRET || "reynard-mcp-secret-key-2025";
  }

  /**
   * Set up test environment with test clients
   */
  async setupTestEnvironment(clientId: string, clientSecret: string): Promise<void> {
    const testClient: MCPClient = {
      client_id: clientId,
      client_type: "agent",
      permissions: ["mcp:read", "mcp:write", "mcp:admin"],
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.testClients.set(clientId, testClient);

    // Register client with backend if needed
    try {
      await request.post(`${this.fastApiBackendUrl}/api/mcp/register`, {
        data: {
          client_id: clientId,
          client_secret: clientSecret,
          client_type: "agent",
          permissions: testClient.permissions,
        },
      });
    } catch (error) {
      // Client might already exist, that's okay
      console.log(`Client ${clientId} might already exist`);
    }
  }

  /**
   * Clean up test environment
   */
  async cleanupTestEnvironment(clientId: string): Promise<void> {
    this.testClients.delete(clientId);

    // Unregister client from backend if needed
    try {
      await request.delete(`${this.fastApiBackendUrl}/api/mcp/clients/${clientId}`);
    } catch (error) {
      // Client might not exist, that's okay
      console.log(`Client ${clientId} might not exist for cleanup`);
    }
  }

  /**
   * Get a valid token for testing
   */
  async getValidToken(clientId: string, additionalPermissions: string[] = []): Promise<string> {
    const client = this.testClients.get(clientId);
    if (!client) {
      throw new Error(`Test client ${clientId} not found`);
    }

    const permissions = [...client.permissions, ...additionalPermissions];

    const tokenData: MCPTokenData = {
      client_id: clientId,
      client_type: client.client_type,
      permissions,
      issued_at: Date.now() / 1000,
      expires_at: Date.now() / 1000 + 3600, // 1 hour
      scope: "mcp",
    };

    return jwt.sign(tokenData, this.jwtSecret, { algorithm: "HS256" });
  }

  /**
   * Generate token with specific permissions
   */
  async generateTokenWithPermissions(clientId: string, permissions: string[]): Promise<string> {
    const client = this.testClients.get(clientId);
    if (!client) {
      throw new Error(`Test client ${clientId} not found`);
    }

    const tokenData: MCPTokenData = {
      client_id: clientId,
      client_type: client.client_type,
      permissions,
      issued_at: Date.now() / 1000,
      expires_at: Date.now() / 1000 + 3600,
      scope: "mcp",
    };

    return jwt.sign(tokenData, this.jwtSecret, { algorithm: "HS256" });
  }

  /**
   * Generate expired token
   */
  async generateExpiredToken(clientId: string): Promise<string> {
    const client = this.testClients.get(clientId);
    if (!client) {
      throw new Error(`Test client ${clientId} not found`);
    }

    const tokenData: MCPTokenData = {
      client_id: clientId,
      client_type: client.client_type,
      permissions: client.permissions,
      issued_at: Date.now() / 1000 - 86400, // 24 hours ago
      expires_at: Date.now() / 1000 - 3600, // 1 hour ago
      scope: "mcp",
    };

    return jwt.sign(tokenData, this.jwtSecret, { algorithm: "HS256" });
  }

  /**
   * Generate token that expires in specified seconds
   */
  async generateExpiringToken(clientId: string, expiresInSeconds: number): Promise<string> {
    const client = this.testClients.get(clientId);
    if (!client) {
      throw new Error(`Test client ${clientId} not found`);
    }

    const tokenData: MCPTokenData = {
      client_id: clientId,
      client_type: client.client_type,
      permissions: client.permissions,
      issued_at: Date.now() / 1000,
      expires_at: Date.now() / 1000 + expiresInSeconds,
      scope: "mcp",
    };

    return jwt.sign(tokenData, this.jwtSecret, { algorithm: "HS256" });
  }

  /**
   * Generate token with invalid signature
   */
  async generateTokenWithInvalidSignature(clientId: string): Promise<string> {
    const client = this.testClients.get(clientId);
    if (!client) {
      throw new Error(`Test client ${clientId} not found`);
    }

    const tokenData: MCPTokenData = {
      client_id: clientId,
      client_type: client.client_type,
      permissions: client.permissions,
      issued_at: Date.now() / 1000,
      expires_at: Date.now() / 1000 + 3600,
      scope: "mcp",
    };

    // Use wrong secret to create invalid signature
    const wrongSecret = "wrong-secret-key";
    return jwt.sign(tokenData, wrongSecret, { algorithm: "HS256" });
  }

  /**
   * Bootstrap authentication with FastAPI backend
   */
  async bootstrapAuthentication(
    clientId: string,
    clientSecret: string,
    permissions: string[] = ["mcp:read"]
  ): Promise<BootstrapResponse> {
    const response = await request.post(`${this.fastApiBackendUrl}/api/mcp/bootstrap`, {
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        client_type: "agent",
        permissions,
      },
    });

    if (response.status() !== 200) {
      throw new Error(`Bootstrap authentication failed: ${response.status()}`);
    }

    return await response.json();
  }

  /**
   * Refresh token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<BootstrapResponse> {
    const response = await request.post(`${this.fastApiBackendUrl}/api/mcp/refresh`, {
      data: { refresh_token: refreshToken },
    });

    if (response.status() !== 200) {
      throw new Error(`Token refresh failed: ${response.status()}`);
    }

    return await response.json();
  }

  /**
   * Revoke a token
   */
  async revokeToken(token: string): Promise<void> {
    const response = await request.post(`${this.fastApiBackendUrl}/api/mcp/revoke`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { token },
    });

    if (response.status() !== 200) {
      throw new Error(`Token revocation failed: ${response.status()}`);
    }
  }

  /**
   * Test MCP server access with token
   */
  async testMCPServerAccess(token: string, endpoint: string = "/api/mcp/tools/list"): Promise<Response> {
    return await request.get(`${this.mcpServerUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Test FastAPI backend access with token
   */
  async testBackendAccess(token: string, endpoint: string = "/api/mcp/status"): Promise<Response> {
    return await request.get(`${this.fastApiBackendUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Validate token structure and claims
   */
  validateTokenStructure(token: string): { valid: boolean; claims?: any; error?: string } {
    try {
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded || typeof decoded === "string") {
        return { valid: false, error: "Invalid token structure" };
      }

      const payload = decoded.payload as MCPTokenData;

      // Validate required claims
      const requiredClaims = ["client_id", "client_type", "permissions", "issued_at", "expires_at", "scope"];
      for (const claim of requiredClaims) {
        if (!(claim in payload)) {
          return { valid: false, error: `Missing required claim: ${claim}` };
        }
      }

      // Validate claim types
      if (typeof payload.client_id !== "string") {
        return { valid: false, error: "client_id must be a string" };
      }

      if (typeof payload.client_type !== "string") {
        return { valid: false, error: "client_type must be a string" };
      }

      if (!Array.isArray(payload.permissions)) {
        return { valid: false, error: "permissions must be an array" };
      }

      if (typeof payload.issued_at !== "number") {
        return { valid: false, error: "issued_at must be a number" };
      }

      if (typeof payload.expires_at !== "number") {
        return { valid: false, error: "expires_at must be a number" };
      }

      return { valid: true, claims: payload };
    } catch (error) {
      return { valid: false, error: `Token validation error: ${error}` };
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as MCPTokenData;
      if (!decoded || !decoded.expires_at) {
        return true;
      }

      return Date.now() / 1000 > decoded.expires_at;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as MCPTokenData;
      if (!decoded || !decoded.expires_at) {
        return null;
      }

      return new Date(decoded.expires_at * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token permissions
   */
  getTokenPermissions(token: string): string[] {
    try {
      const decoded = jwt.decode(token) as MCPTokenData;
      return decoded?.permissions || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if token has specific permission
   */
  hasPermission(token: string, permission: string): boolean {
    const permissions = this.getTokenPermissions(token);
    return permissions.includes(permission);
  }

  /**
   * Get test client information
   */
  getTestClient(clientId: string): MCPClient | undefined {
    return this.testClients.get(clientId);
  }

  /**
   * List all test clients
   */
  listTestClients(): MCPClient[] {
    return Array.from(this.testClients.values());
  }

  /**
   * Create a new test client
   */
  createTestClient(
    clientId: string,
    clientType: "agent" | "tool" | "user" = "agent",
    permissions: string[] = ["mcp:read"]
  ): MCPClient {
    const client: MCPClient = {
      client_id: clientId,
      client_type: clientType,
      permissions,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.testClients.set(clientId, client);
    return client;
  }

  /**
   * Deactivate a test client
   */
  deactivateTestClient(clientId: string): boolean {
    const client = this.testClients.get(clientId);
    if (client) {
      client.is_active = false;
      return true;
    }
    return false;
  }

  /**
   * Activate a test client
   */
  activateTestClient(clientId: string): boolean {
    const client = this.testClients.get(clientId);
    if (client) {
      client.is_active = true;
      return true;
    }
    return false;
  }
}
