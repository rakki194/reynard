/**
 * Authentication Middleware
 *
 * Handles various authentication methods including bearer tokens,
 * basic auth, API keys, and token refresh functionality.
 */

import { HTTPRequestOptions, HTTPMiddleware, AuthConfig, TokenRefreshConfig } from "../types";

/**
 * Create authentication middleware
 */
export function createAuthMiddleware(authConfig: AuthConfig): HTTPMiddleware {
  return {
    request: config => {
      const headers = { ...config.headers };

      switch (authConfig.type) {
        case "bearer":
          if (authConfig.token) {
            headers.Authorization = `Bearer ${authConfig.token}`;
          }
          break;

        case "basic":
          if (authConfig.username && authConfig.password) {
            const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
            headers.Authorization = `Basic ${credentials}`;
          }
          break;

        case "api-key":
          if (authConfig.apiKey) {
            const headerName = authConfig.apiKeyHeader || "X-API-Key";
            headers[headerName] = authConfig.apiKey;
          }
          break;

        case "custom":
          if (authConfig.customHeaders) {
            Object.assign(headers, authConfig.customHeaders);
          }
          break;
      }

      return { ...config, headers };
    },
  };
}

/**
 * Create token refresh middleware
 */
export function createTokenRefreshMiddleware(refreshConfig: TokenRefreshConfig): HTTPMiddleware {
  let isRefreshing = false;
  let refreshPromise: Promise<string> | null = null;

  return {
    request: async config => {
      // If we're already refreshing, wait for it
      if (isRefreshing && refreshPromise) {
        try {
          const newToken = await refreshPromise;
          return {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
        } catch (error) {
          refreshConfig.onTokenExpired();
          throw error;
        }
      }

      return config;
    },

    error: async error => {
      // Check if it's an authentication error
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken(refreshConfig);

        try {
          const newToken = await refreshPromise;
          refreshConfig.onTokenRefresh(newToken);

          // Retry the original request with new token
          // This would need to be handled by the client
          return error;
        } catch (refreshError) {
          refreshConfig.onTokenExpired();
          throw refreshError;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }

      return error;
    },
  };
}

async function refreshToken(config: TokenRefreshConfig): Promise<string> {
  const response = await fetch(config.refreshEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: config.refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  return data.accessToken || data.token;
}
