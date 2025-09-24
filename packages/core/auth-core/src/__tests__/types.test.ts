/**
 * Auth Core Types Tests
 * Tests for type definitions and constants
 */

import { describe, it, expect } from "vitest";
import { DEFAULT_AUTH_CONFIG } from "../types";

describe("Auth Core Types", () => {
  describe("DEFAULT_AUTH_CONFIG", () => {
    it("should have correct default configuration", () => {
      expect(DEFAULT_AUTH_CONFIG).toBeDefined();
      expect(DEFAULT_AUTH_CONFIG.apiBaseUrl).toBe("/api");
      expect(DEFAULT_AUTH_CONFIG.loginEndpoint).toBe("/auth/login");
      expect(DEFAULT_AUTH_CONFIG.registerEndpoint).toBe("/auth/register");
      expect(DEFAULT_AUTH_CONFIG.refreshEndpoint).toBe("/auth/refresh");
      expect(DEFAULT_AUTH_CONFIG.profileEndpoint).toBe("/auth/profile");
      expect(DEFAULT_AUTH_CONFIG.tokenStorageKey).toBe("auth_token");
      expect(DEFAULT_AUTH_CONFIG.refreshTokenStorageKey).toBe("refresh_token");
      expect(DEFAULT_AUTH_CONFIG.autoRefresh).toBe(true);
      expect(DEFAULT_AUTH_CONFIG.refreshThresholdMinutes).toBe(10);
      expect(DEFAULT_AUTH_CONFIG.loginRedirectPath).toBe("/dashboard");
      expect(DEFAULT_AUTH_CONFIG.logoutRedirectPath).toBe("/login");
      expect(DEFAULT_AUTH_CONFIG.enableRememberMe).toBe(true);
      expect(DEFAULT_AUTH_CONFIG.sessionTimeoutMinutes).toBe(30);
    });
  });
});
