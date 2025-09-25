/**
 * useAuth Hook Tests
 * Tests for the useAuth SolidJS composable
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@solidjs/testing-library";
import { useAuth } from "../useAuth";
import { HTTPClient } from "reynard-http-client";

// Mock the auth-core package
vi.mock("reynard-auth-core", () => ({
  createAuthOrchestrator: vi.fn(() => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshTokens: vi.fn(),
    changePassword: vi.fn(),
    initialize: vi.fn(),
    user: vi.fn(() => null),
    authState: vi.fn(() => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isRefreshing: false,
    })),
    tokenManager: {
      getAccessToken: vi.fn(() => null),
      getRefreshToken: vi.fn(() => null),
    },
  })),
  DEFAULT_AUTH_CONFIG: {
    apiBaseUrl: "/api",
    loginEndpoint: "/auth/login",
    registerEndpoint: "/auth/register",
    refreshEndpoint: "/auth/refresh",
    profileEndpoint: "/auth/profile",
    tokenStorageKey: "auth_token",
    refreshTokenStorageKey: "refresh_token",
    autoRefresh: true,
    refreshThresholdMinutes: 10,
    loginRedirectPath: "/dashboard",
    logoutRedirectPath: "/login",
    enableRememberMe: true,
    sessionTimeoutMinutes: 30,
  },
}));

describe("useAuth", () => {
  let mockHttpClient: HTTPClient;

  beforeEach(() => {
    mockHttpClient = new HTTPClient({ baseUrl: "/api" });
  });

  it("should return auth state and actions", () => {
    const { result } = renderHook(() =>
      useAuth({
        config: { apiBaseUrl: "/api" },
        autoInit: false,
      })
    );

    expect(result).toBeDefined();
    expect(result.authState).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.isAuthenticated).toBeDefined();
    expect(result.isLoading).toBeDefined();
    expect(result.error).toBeDefined();
    expect(result.isRefreshing).toBeDefined();
    expect(result.login).toBeDefined();
    expect(result.register).toBeDefined();
    expect(result.logout).toBeDefined();
    expect(result.refreshTokens).toBeDefined();
    expect(result.changePassword).toBeDefined();
    expect(result.initialize).toBeDefined();
    expect(result.tokenManager).toBeDefined();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useAuth({
        config: { apiBaseUrl: "/api" },
        autoInit: false,
      })
    );

    expect(result.isAuthenticated()).toBe(false);
    expect(result.isLoading()).toBe(false);
    expect(result.error()).toBe(null);
    expect(result.isRefreshing()).toBe(false);
    expect(result.user()).toBe(null);
  });
});
