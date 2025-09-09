/**
 * Authentication Composable
 * Main authentication hook with state management and API integration
 */

import { createSignal, onMount, onCleanup } from "solid-js";

import type { AuthState, AuthConfiguration, AuthCallbacks } from "../types";
import { createAuthOrchestrator } from "../utils";
import { DEFAULT_AUTH_CONFIG } from "../types";

export interface UseAuthOptions {
  /** Authentication configuration */
  config?: Partial<AuthConfiguration>;
  /** Authentication callbacks */
  callbacks?: AuthCallbacks;
  /** Auto-initialize on mount */
  autoInit?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const config = { ...DEFAULT_AUTH_CONFIG, ...options.config };
  const callbacks = options.callbacks || {};

  // Auth state
  const [authState, setAuthState] = createSignal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isRefreshing: false,
  });

  // Update auth state helper
  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => {
      const newState = { ...prev, ...updates };
      callbacks.onAuthStateChange?.(newState);
      return newState;
    });
  };

  // Create auth orchestrator
  const orchestrator = createAuthOrchestrator(
    config,
    callbacks,
    authState,
    updateAuthState,
  );

  // Auto-initialize if enabled
  onMount(() => {
    if (options.autoInit !== false) {
      orchestrator.authInitialization.initialize();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    orchestrator.tokenRefreshManager.clearRefreshTimer();
  });

  return {
    // State
    authState,
    user: () => authState().user,
    isAuthenticated: () => authState().isAuthenticated,
    isLoading: () => authState().isLoading,
    error: () => authState().error,
    isRefreshing: () => authState().isRefreshing,

    // Actions
    login: orchestrator.authActions.login,
    register: orchestrator.authActions.register,
    logout: orchestrator.authActions.logout,
    refreshTokens: orchestrator.tokenRefreshManager.refreshTokens,
    changePassword: orchestrator.authActions.changePassword,
    updateProfile: orchestrator.userProfileManager.updateProfile,
    initialize: orchestrator.authInitialization.initialize,

    // Resources
    userProfile: orchestrator.userProfileManager.userProfile,

    // Utilities
    authFetch: orchestrator.authFetch,
    tokenManager: orchestrator.tokenManager,
  };
}
