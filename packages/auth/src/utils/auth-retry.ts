/**
 * Authentication Retry Logic
 * Handles token refresh and request retry for unauthorized responses
 */

import type { AuthConfiguration, AuthTokens } from "../types";
import type { TokenManager } from "./token-utils";
import type { AuthFetchOptions } from "./api-utils";
import { buildAuthHeaders } from "./auth-headers";

export interface RetryConfig {
  config: AuthConfiguration;
  tokenManager: TokenManager;
  onUnauthorized: () => void;
  onTokenRefresh: () => Promise<void>;
}

/**
 * Handles unauthorized response with token refresh and retry
 */
export const handleUnauthorizedResponse = async (
  url: string,
  options: AuthFetchOptions,
  retryConfig: RetryConfig,
): Promise<Response | null> => {
  const { config, tokenManager, onUnauthorized, onTokenRefresh } = retryConfig;
  const token = tokenManager.getAccessToken();

  if (!token || !config.autoRefresh) {
    onUnauthorized();
    return null;
  }

  try {
    await onTokenRefresh();

    // Retry the original request with new token
    const newToken = tokenManager.getAccessToken();
    if (newToken) {
      const retryHeaders = buildAuthHeaders({
        token: newToken,
        options,
      });

      return fetch(`${config.apiBaseUrl}${url}`, {
        ...options,
        headers: retryHeaders,
      });
    }
  } catch (error) {
    onUnauthorized();
    throw error;
  }

  return null;
};
