/**
 * API Utilities for Authentication
 * Handles authenticated requests, CSRF protection, and response parsing
 * Uses the consolidated HTTP system from reynard-connection.
 */

import type { ApiResponse, AuthConfiguration } from "../types";
import type { TokenManager } from "./token-utils";
import { buildAuthHeaders } from "./auth-headers";
import { handleUnauthorizedResponse } from "./auth-retry";
import {
  HTTPClient,
  createAuthMiddleware,
  createTokenRefreshMiddleware,
  type HTTPRequestOptions,
  type HTTPResponse,
  type AuthConfig,
  type TokenRefreshConfig,
} from "reynard-connection";

export interface AuthFetchOptions {
  method?: string;
  headers?: Record<string, string> | Headers;
  body?: string | FormData | URLSearchParams | ReadableStream | null;
  credentials?: "omit" | "same-origin" | "include";
  mode?: "cors" | "no-cors" | "same-origin";
  cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
  redirect?: "follow" | "error" | "manual";
  referrer?: string;
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  integrity?: string;
  keepalive?: boolean;
  signal?: globalThis.AbortSignal | null;
}

/**
 * Creates an authenticated HTTP client using the consolidated HTTP system
 */
export const createAuthHTTPClient = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  onUnauthorized: () => void,
  onTokenRefresh: () => Promise<void>
): HTTPClient => {
  const authConfig: AuthConfig = {
    type: "bearer",
    token: tokenManager.getAccessToken() || undefined,
  };

  const tokenRefreshConfig: TokenRefreshConfig = {
    refreshEndpoint: `${config.apiBaseUrl}/auth/refresh`,
    refreshToken: tokenManager.getRefreshToken() || "",
    onTokenRefresh: (newToken: string) => {
      tokenManager.setTokens(newToken);
      onTokenRefresh();
    },
    onTokenExpired: () => {
      onUnauthorized();
    },
  };

  const client = new HTTPClient({
    baseUrl: config.apiBaseUrl || "",
    timeout: 30000,
    retries: 3,
    enableRetry: true,
    enableCircuitBreaker: true,
    enableMetrics: true,
    middleware: [createAuthMiddleware(authConfig), createTokenRefreshMiddleware(tokenRefreshConfig)],
  });

  return client;
};

/**
 * Creates an authenticated fetch function with CSRF protection (legacy)
 */
export const createAuthFetch = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  onUnauthorized: () => void,
  onTokenRefresh: () => Promise<void>
) => {
  return async (url: string, options: AuthFetchOptions = {}): Promise<Response> => {
    const token = tokenManager.getAccessToken();
    const headers = buildAuthHeaders({ token: token || undefined, options });

    const response = await fetch(`${config.apiBaseUrl}${url}`, {
      ...options,
      headers,
    });

    // Handle unauthorized responses
    if (response.status === 401) {
      const retryResponse = await handleUnauthorizedResponse(url, options, {
        config,
        tokenManager,
        onUnauthorized,
        onTokenRefresh,
      });

      if (retryResponse) {
        return retryResponse;
      }
    }

    return response;
  };
};

/**
 * Parse API response into standardized format
 */
export const parseApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.message || data.detail || "Request failed",
      success: response.ok,
      status: response.status,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  } catch {
    return {
      error: "Failed to parse response",
      success: false,
      status: response.status,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
};
