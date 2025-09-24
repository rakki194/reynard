/**
 * Authentication Orchestrator
 * Main orchestrator that sets up all auth modules and provides the main interface
 */

import type { AuthState, AuthConfiguration, AuthCallbacks } from "./types";
import { TokenManager } from "./token-manager";
import { createAuthClient } from "./auth-client";

export interface AuthOrchestrator {
  authState: () => AuthState;
  authClient: ReturnType<typeof createAuthClient>;
  tokenManager: TokenManager;
  initialize: () => Promise<void>;
}

/**
 * Creates the main authentication orchestrator
 */
export const createAuthOrchestrator = (
  config: AuthConfiguration,
  callbacks: AuthCallbacks,
  authState: () => AuthState,
  updateAuthState: (updates: Partial<AuthState>) => void
): AuthOrchestrator => {
  // Token manager instance
  const tokenManager = TokenManager.getInstance(config.tokenStorageKey, config.refreshTokenStorageKey);

  // Create authentication client
  const authClient = createAuthClient(config, tokenManager, authState, updateAuthState, callbacks);

  // Initialize authentication state
  const initialize = async (): Promise<void> => {
    updateAuthState({ isLoading: true });

    try {
      const token = tokenManager.getAccessToken();

      if (token && !tokenManager.validateToken(token).error) {
        // Token is valid, get user profile
        const user = await authClient.getCurrentUser();
        
        if (user) {
          updateAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token is invalid, clear it
          tokenManager.clearTokens();
          updateAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        // No valid token
        updateAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      tokenManager.clearTokens();
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return {
    authState,
    authClient,
    tokenManager,
    initialize,
  };
};
