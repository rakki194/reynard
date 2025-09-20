/**
 * Authentication Composable
 * Main authentication hook with state management and API integration
 */

import { createSignal, onMount, onCleanup } from "solid-js";

import type { AuthState, AuthConfiguration, AuthCallbacks, User } from "../types";
import { createAuthOrchestrator } from "../utils";
import { DEFAULT_AUTH_CONFIG } from "../types";
import { useAuth as useGeneratedAuth, createReynardApiClient, type UserPublic } from "reynard-api-client";

// Utility function to convert UserPublic to User
function convertUserResponseToUser(userResponse: UserPublic | null): User | null {
  if (!userResponse) return null;

  return {
    id: userResponse.id?.toString() || "",
    username: userResponse.username,
    email: userResponse.email || undefined,
    fullName: undefined, // UserPublic doesn't have fullName
    role: userResponse.role === "regular" ? "user" : userResponse.role as any,
    avatarUrl: userResponse.profilePictureUrl || undefined,
    createdAt: userResponse.createdAt || new Date(),
    lastLogin: undefined,
    isActive: userResponse.isActive,
    preferences: undefined,
    profile: undefined,
  };
}

export interface UseAuthOptions {
  /** Authentication configuration */
  config?: Partial<AuthConfiguration>;
  /** Authentication callbacks */
  callbacks?: AuthCallbacks;
  /** Auto-initialize on mount */
  autoInit?: boolean;
  /** API client instance */
  apiClient?: any;
}

export function useAuth(options: UseAuthOptions = {}) {
  const config = { ...DEFAULT_AUTH_CONFIG, ...options.config };
  const callbacks = options.callbacks || {};

  // Create API client for generated auth
  const apiClient =
    options.apiClient ||
    createReynardApiClient({
      basePath: config.apiBaseUrl,
    });

  // Use generated auth composable
  const generatedAuth = useGeneratedAuth({
    basePath: config.apiBaseUrl,
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
    user: () => convertUserResponseToUser(generatedAuth.user()) || authState().user,
    isAuthenticated: () => generatedAuth.isAuthenticated() || authState().isAuthenticated,
    isLoading: () => authState().isLoading,
    error: () => authState().error,
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
    logout: async () => {
      await generatedAuth.logout();
      await orchestrator.authActions.logout();
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
