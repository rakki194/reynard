/**
 * Auth Client Tests
 * Tests for the authentication client functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthClient } from "../auth-client";
import { TokenManager } from "../token-manager";
import { DEFAULT_AUTH_CONFIG } from "../types";

// Mock HTTPClient
vi.mock("reynard-http-client", () => ({
  HTTPClient: vi.fn().mockImplementation(() => ({
    post: vi.fn(),
    get: vi.fn(),
  })),
}));

describe("AuthClient", () => {
  let tokenManager: TokenManager;
  let mockUpdateAuthState: any;
  let mockCallbacks: any;

  beforeEach(() => {
    tokenManager = TokenManager.getInstance("test-access", "test-refresh");
    mockUpdateAuthState = vi.fn();
    mockCallbacks = {
      onLoginSuccess: vi.fn(),
      onLoginError: vi.fn(),
      onLogout: vi.fn(),
    };
  });

  describe("createAuthClient", () => {
    it("should create auth client with default config", () => {
      const authClient = createAuthClient(
        DEFAULT_AUTH_CONFIG,
        tokenManager,
        () => ({}),
        mockUpdateAuthState,
        mockCallbacks
      );

      expect(authClient).toBeDefined();
      expect(authClient.login).toBeDefined();
      expect(authClient.register).toBeDefined();
      expect(authClient.logout).toBeDefined();
      expect(authClient.refreshTokens).toBeDefined();
      expect(authClient.changePassword).toBeDefined();
      expect(authClient.getCurrentUser).toBeDefined();
    });

    it("should create auth client with custom config", () => {
      const customConfig = {
        ...DEFAULT_AUTH_CONFIG,
        apiBaseUrl: "https://custom-api.com",
        loginEndpoint: "/custom/login",
      };

      const authClient = createAuthClient(customConfig, tokenManager, () => ({}), mockUpdateAuthState, mockCallbacks);

      expect(authClient).toBeDefined();
    });
  });

  describe("login", () => {
    it("should handle successful login", async () => {
      const mockResponse = {
        status: 200,
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          user: {
            id: "user123",
            username: "testuser",
            email: "test@example.com",
          },
        },
      };

      const { HTTPClient } = await import("reynard-http-client");
      const mockClient = new (HTTPClient as any)();
      mockClient.post.mockResolvedValue(mockResponse);

      // Set up the mock to return our mock client
      (HTTPClient as any).mockImplementation(() => mockClient);

      const authClient = createAuthClient(
        DEFAULT_AUTH_CONFIG,
        tokenManager,
        () => ({}),
        mockUpdateAuthState,
        mockCallbacks
      );

      await authClient.login({ username: "testuser", password: "password" });

      expect(mockClient.post).toHaveBeenCalledWith("/auth/login", { username: "testuser", password: "password" });
    });

    it("should handle login error", async () => {
      const mockResponse = {
        status: 401,
        data: { message: "Invalid credentials" },
      };

      const { HTTPClient } = await import("reynard-http-client");
      const mockClient = new (HTTPClient as any)();
      mockClient.post.mockResolvedValue(mockResponse);

      // Set up the mock to return our mock client
      (HTTPClient as any).mockImplementation(() => mockClient);

      const authClient = createAuthClient(
        DEFAULT_AUTH_CONFIG,
        tokenManager,
        () => ({}),
        mockUpdateAuthState,
        mockCallbacks
      );

      await expect(authClient.login({ username: "testuser", password: "wrong" })).rejects.toThrow();
    });
  });

  describe("register", () => {
    it("should handle successful registration", async () => {
      const mockResponse = {
        status: 201,
        data: {
          user: {
            id: "user123",
            username: "newuser",
            email: "new@example.com",
          },
          message: "User created successfully",
        },
      };

      const { HTTPClient } = await import("reynard-http-client");
      const mockClient = new (HTTPClient as any)();
      mockClient.post.mockResolvedValue(mockResponse);

      // Set up the mock to return our mock client
      (HTTPClient as any).mockImplementation(() => mockClient);

      const authClient = createAuthClient(
        DEFAULT_AUTH_CONFIG,
        tokenManager,
        () => ({}),
        mockUpdateAuthState,
        mockCallbacks
      );

      await authClient.register({
        username: "newuser",
        email: "new@example.com",
        password: "password",
      });

      expect(mockClient.post).toHaveBeenCalledWith("/auth/register", {
        username: "newuser",
        email: "new@example.com",
        password: "password",
      });
    });
  });
});
