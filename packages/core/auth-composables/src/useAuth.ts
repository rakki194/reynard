/**
 * Authentication Composable
 * Main authentication hook with state management and API integration
 */

import { createSignal, onMount, onCleanup } from "solid-js";
import type {
  AuthState,
  AuthConfiguration,
  AuthCallbacks,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
} from "reynard-auth-core";
import { createAuthOrchestrator, DEFAULT_AUTH_CONFIG } from "reynard-auth-core";

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
    setAuthState(prev => {
      const newState = { ...prev, ...updates };
      callbacks.onAuthStateChange?.(newState);
      return newState;
    });
  };

  // Create auth orchestrator
  const orchestrator = createAuthOrchestrator(config, callbacks, authState, updateAuthState);

  // Auto-initialize if enabled
  onMount(() => {
    if (options.autoInit !== false) {
      orchestrator.initialize();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    // Cleanup any timers or subscriptions if needed
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
    login: async (credentials: LoginCredentials) => {
      await orchestrator.authClient.login(credentials);
    },
    register: async (data: RegisterData) => {
      await orchestrator.authClient.register(data);
    },
    logout: async () => {
      await orchestrator.authClient.logout();
    },
    refreshTokens: async () => {
      await orchestrator.authClient.refreshTokens();
    },
    changePassword: async (data: PasswordChangeData) => {
      await orchestrator.authClient.changePassword(data);
    },
    initialize: async () => {
      await orchestrator.initialize();
    },

    // Utilities
    tokenManager: orchestrator.tokenManager,
  };
}
