/**
 * Mock Endpoint Configurations for E2E Testing
 *
 * Provides default endpoint configurations for mock backend servers.
 */

import type { MockResponse } from "./mock-types";

/**
 * Default authentication endpoint responses
 */
export const DEFAULT_AUTH_ENDPOINTS: Record<string, MockResponse> = {
  "/api/auth/register": {
    status: 201,
    body: { message: "User created successfully" },
  },
  "/api/auth/login": {
    status: 200,
    body: {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      token_type: "bearer",
    },
  },
  "/api/auth/refresh": {
    status: 200,
    body: {
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      token_type: "bearer",
    },
  },
  "/api/auth/logout": {
    status: 200,
    body: { message: "Successfully logged out" },
  },
  "/api/auth/me": {
    status: 200,
    body: {
      id: "123",
      username: "testuser",
      email: "test@example.com",
      is_active: true,
      role: "user",
    },
  },
};

/**
 * Gatekeeper-specific authentication endpoints
 */
export const GATEKEEPER_AUTH_ENDPOINTS: Record<string, MockResponse> = {
  "/auth/login": {
    status: 200,
    body: {
      access_token: "gatekeeper-access-token",
      refresh_token: "gatekeeper-refresh-token",
      token_type: "bearer",
    },
  },
  "/auth/refresh": {
    status: 200,
    body: {
      access_token: "new-gatekeeper-access-token",
      refresh_token: "new-gatekeeper-refresh-token",
      token_type: "bearer",
    },
  },
  "/auth/logout": {
    status: 200,
    body: { message: "Successfully logged out" },
  },
};
