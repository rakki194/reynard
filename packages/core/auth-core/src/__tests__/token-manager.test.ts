/**
 * Token Manager Tests
 * Tests for the AuthTokenManager class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TokenManager, isTokenExpired, getUserFromToken } from "../token-manager";

// Mock jwt-decode
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn((token: string) => {
    if (token === "valid-token") {
      return {
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
        username: "testuser",
        email: "test@example.com",
      };
    }
    if (token === "expired-token") {
      return {
        sub: "user123",
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200,
        username: "testuser",
        email: "test@example.com",
      };
    }
    throw new Error("Invalid token");
  }),
}));

describe("TokenManager", () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    tokenManager = TokenManager.getInstance("test-access", "test-refresh");
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = TokenManager.getInstance("key1", "key2");
      const instance2 = TokenManager.getInstance("key1", "key2");
      expect(instance1).toBe(instance2);
    });
  });

  describe("token management", () => {
    it("should set and get access token", () => {
      tokenManager.setTokens("test-access-token");
      expect(tokenManager.getAccessToken()).toBe("test-access-token");
    });

    it("should set and get refresh token", () => {
      tokenManager.setTokens("test-access-token", "test-refresh-token");
      expect(tokenManager.getRefreshToken()).toBe("test-refresh-token");
    });

    it("should set both tokens", () => {
      tokenManager.setTokens("access-token", "refresh-token");
      expect(tokenManager.getAccessToken()).toBe("access-token");
      expect(tokenManager.getRefreshToken()).toBe("refresh-token");
    });

    it("should clear tokens", () => {
      tokenManager.setTokens("access-token", "refresh-token");
      tokenManager.clearTokens();
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
    });
  });

  describe("token validation", () => {
    it("should validate valid token", () => {
      const isValid = isTokenExpired("valid-token");
      expect(isValid).toBe(false);
    });

    it("should detect expired token", () => {
      const isExpired = isTokenExpired("expired-token");
      expect(isExpired).toBe(true);
    });

    it("should handle invalid token", () => {
      const isExpired = isTokenExpired("invalid-token");
      expect(isExpired).toBe(true);
    });
  });

  describe("user extraction", () => {
    it("should extract user from valid token", () => {
      const user = getUserFromToken("valid-token");
      expect(user).toEqual({
        username: "user123",
        role: undefined,
      });
    });

    it("should return null for invalid token", () => {
      const user = getUserFromToken("invalid-token");
      expect(user).toBeNull();
    });
  });

  describe("token info", () => {
    it("should get token info for valid token", () => {
      const info = tokenManager.getTokenInfo("valid-token");
      expect(info).toBeDefined();
      expect(info?.sub).toBe("user123");
    });

    it("should return null for invalid token", () => {
      const info = tokenManager.getTokenInfo("invalid-token");
      expect(info).toBeNull();
    });
  });
});
