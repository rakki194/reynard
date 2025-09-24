/**
 * Authentication Initialization
 * Handles initial auth state setup and token validation
 */

import type { User, AuthState, AuthConfiguration, AuthCallbacks } from "../types";
import { TokenManager, isTokenExpired, getUserFromToken } from "./token-utils";

export interface AuthInitialization {
  initialize: () => Promise<void>;
}

/**
 * Creates authentication initialization functions
 */
export const createAuthInitialization = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  authState: () => AuthState,
  updateAuthState: (updates: Partial<AuthState>) => void,
  callbacks: AuthCallbacks,
  setupTokenRefresh: () => void,
  fetchUserProfile: () => void,
  logout: () => Promise<void>
): AuthInitialization => {
  const initialize = async (): Promise<void> => {
    updateAuthState({ isLoading: true });

    try {
      const token = tokenManager.getAccessToken();

      if (token && !isTokenExpired(token)) {
        const userInfo = getUserFromToken(token);

        if (userInfo) {
          updateAuthState({
            user: userInfo as User,
            isAuthenticated: true,
            isLoading: false,
          });

          // Setup auto-refresh
          if (config.autoRefresh) {
            setupTokenRefresh();
          }

          // Fetch full user profile
          fetchUserProfile();
        } else {
          await logout();
        }
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      await logout();
    }

    updateAuthState({ isLoading: false });
  };

  return {
    initialize,
  };
};
