/**
 * API Utilities for Authentication
 * Handles authenticated requests, CSRF protection, and response parsing
 */

import type { ApiResponse, AuthConfiguration } from "../types";
import type { TokenManager } from "./token-utils";
import { buildAuthHeaders } from "./auth-headers";
import { handleUnauthorizedResponse } from "./auth-retry";

export interface AuthFetchOptions {
  method?: string;
  headers?: Record<string, string> | Headers;
  body?: string | FormData | URLSearchParams | ReadableStream | null;
  credentials?: "omit" | "same-origin" | "include";
  mode?: "cors" | "no-cors" | "same-origin";
  cache?:
    | "default"
    | "no-store"
    | "reload"
    | "no-cache"
    | "force-cache"
    | "only-if-cached";
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
 * Creates an authenticated fetch function with CSRF protection
 */
export const createAuthFetch = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  onUnauthorized: () => void,
  onTokenRefresh: () => Promise<void>,
) => {
  return async (
    url: string,
    options: AuthFetchOptions = {},
  ): Promise<Response> => {
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
export const parseApiResponse = async <T>(
  response: Response,
): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();
    return {
      data: response.ok ? data : undefined,
      error: response.ok
        ? undefined
        : data.message || data.detail || "Request failed",
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
