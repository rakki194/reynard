/**
 * useAuth Tests
 * Tests for the useAuth composable
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@solidjs/testing-library";
import { useAuth } from "../useAuth";

// Mock the auth-core package
vi.mock("reynard-auth-core", () => ({
  createAuthOrchestrator: vi.fn(() => ({
    initializeAuth: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshAccessToken: vi.fn(),
    changePassword: vi.fn(),
    fetchUserProfile: vi.fn(),
    setupTokenRefreshTimer: vi.fn(),
    clearTokenRefreshTimer: vi.fn(),
    authClient: {
      httpClient: {},
    },
    tokenManager: {},
  })),
  DEFAULT_AUTH_CONFIG: {
    apiBaseUrl: "http://localhost:8000",
    tokenStorageKey: "access_token",
    refreshTokenStorageKey: "refresh_token",
    autoRefresh: true,
    refreshThresholdMinutes: 10,
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default config", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.authState).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.isAuthenticated).toBeDefined();
      expect(result.isLoading).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.isRefreshing).toBeDefined();
    });

    it("should initialize with custom config", () => {
      const customConfig = {
        apiBaseUrl: "https://custom-api.com",
        autoRefresh: false,
      };

      const { result } = renderHook(() => useAuth({ config: customConfig }));

      expect(result.authState).toBeDefined();
    });

    it("should initialize with custom callbacks", () => {
      const callbacks = {
        onLoginSuccess: vi.fn(),
        onLoginError: vi.fn(),
        onLogout: vi.fn(),
      };

      const { result } = renderHook(() => useAuth({ callbacks }));

      expect(result.authState).toBeDefined();
    });
  });

  describe("auth methods", () => {
    it("should provide login method", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.login).toBeDefined();
      expect(typeof result.login).toBe("function");
    });

    it("should provide register method", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.register).toBeDefined();
      expect(typeof result.register).toBe("function");
    });

    it("should provide logout method", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.logout).toBeDefined();
      expect(typeof result.logout).toBe("function");
    });

    it("should provide refreshTokens method", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.refreshTokens).toBeDefined();
      expect(typeof result.refreshTokens).toBe("function");
    });

    it("should provide changePassword method", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.changePassword).toBeDefined();
      expect(typeof result.changePassword).toBe("function");
    });

    it("should provide fetchUserProfile method", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.fetchUserProfile).toBeDefined();
      expect(typeof result.fetchUserProfile).toBe("function");
    });
  });

  describe("utilities", () => {
    it("should provide authClient", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.authClient).toBeDefined();
    });

    it("should provide tokenManager", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.tokenManager).toBeDefined();
    });
  });
});
