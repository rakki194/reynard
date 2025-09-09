/**
 * Authentication Composable
 * Main authentication hook with state management and API integration
 */

import { createSignal, onMount, onCleanup } from "solid-js";

import type { AuthState, AuthConfiguration, AuthCallbacks } from "../types";
import { createAuthOrchestrator } from "../utils";
import { DEFAULT_AUTH_CONFIG } from "../types";
import { useAuth as useGeneratedAuth, createReynardApiClient } from "reynard-api-client";

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

  // Create API client for generated auth
  const apiClient = createReynardApiClient({
    basePath: config.baseUrl
  });

  // Use generated auth composable
  const generatedAuth = useGeneratedAuth({
    apiClient,
    onLoginSuccess: (user, tokens) => {
      callbacks.onLoginSuccess?.(user, tokens);
    },
    onLoginError: (error) => {
      callbacks.onLoginError?.(error);
    },
    onRegisterSuccess: (user) => {
      callbacks.onRegisterSuccess?.(user);
    },
    onRegisterError: (error) => {
      callbacks.onRegisterError?.(error);
    }
  });

  // Auth state - integrate with generated auth
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
    // State - integrate with generated auth
    authState,
    user: () => generatedAuth.user() || authState().user,
    isAuthenticated: () => generatedAuth.isAuthenticated() || authState().isAuthenticated,
    isLoading: () => generatedAuth.isLoading() || authState().isLoading,
    error: () => generatedAuth.error() || authState().error,
    isRefreshing: () => authState().isRefreshing,

    // Actions - integrate with generated auth
    login: async (credentials: any) => {
      try {
        await generatedAuth.login(credentials);
      } catch (err) {
        // Fallback to legacy login if needed
        await orchestrator.authActions.login(credentials);
      }
    },
    register: async (data: any) => {
      try {
        await generatedAuth.register(data);
      } catch (err) {
        // Fallback to legacy register if needed
        await orchestrator.authActions.register(data);
      }
    },
    logout: () => {
      generatedAuth.logout();
      orchestrator.authActions.logout();
    },
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
