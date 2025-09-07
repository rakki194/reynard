/**
 * Token Refresh Management
 * Handles automatic token refresh and session management
 */

import { createEffect } from "solid-js";
import type {
  AuthState,
  AuthConfiguration,
  AuthCallbacks,
  AuthTokens,
  User,
} from "../types";
import { TokenManager, decodeToken, getUserFromToken, retryWithBackoff } from "./token-utils";
import { parseApiResponse } from "./api-utils";

export interface TokenRefreshManager {
  refreshTokens: () => Promise<void>;
  setupTokenRefresh: () => void;
  clearRefreshTimer: () => void;
}

/**
 * Creates token refresh management functions
 */
export const createTokenRefreshManager = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  authState: () => AuthState,
  updateAuthState: (updates: Partial<AuthState>) => void,
  callbacks: AuthCallbacks,
  logout: () => Promise<void>
): TokenRefreshManager => {
  let refreshTimer: number | null = null;

  const refreshTokens = async (): Promise<void> => {
    if (authState().isRefreshing) return;

    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    updateAuthState({ isRefreshing: true });

    try {
      const response = await retryWithBackoff(async () => {
        return fetch(`${config.apiBaseUrl}${config.refreshEndpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      });

      const result = await parseApiResponse<AuthTokens>(response);

      if (result.success && result.data) {
        const { accessToken, refreshToken: newRefreshToken } = result.data;

        // Store new tokens
        tokenManager.setTokens(accessToken, newRefreshToken);

        // Update user from new token
        const userInfo = getUserFromToken(accessToken);
        if (userInfo && authState().user && userInfo.username) {
          updateAuthState({
            user: { ...authState().user, ...userInfo } as User,
            isRefreshing: false,
          });
        }

        // Setup next refresh
        if (config.autoRefresh) {
          setupTokenRefresh();
        }

        // Trigger callback
        callbacks.onTokenRefresh?.(result.data);
      } else {
        throw new Error(result.error || "Token refresh failed");
      }
    } catch (error) {
      updateAuthState({ isRefreshing: false });
      await logout();
      callbacks.onSessionExpired?.();
      throw error;
    }
  };

  const setupTokenRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    const token = tokenManager.getAccessToken();
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded) return;

    const now = Date.now() / 1000;
    const refreshThreshold = (config.refreshThresholdMinutes || 10) * 60;
    const timeUntilRefresh = decoded.exp - now - refreshThreshold;

    if (timeUntilRefresh > 0) {
      refreshTimer = window.setTimeout(() => {
        // Use a reactive effect to handle the refresh
        createEffect(() => {
          // This will run in a proper reactive context
          if (!authState().isRefreshing) {
            refreshTokens().catch(console.error);
          }
        });
      }, timeUntilRefresh * 1000);
    } else {
      // Token is already close to expiry, refresh immediately
      refreshTokens().catch(console.error);
    }
  };

  const clearRefreshTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  };

  return {
    refreshTokens,
    setupTokenRefresh,
    clearRefreshTimer,
  };
};
