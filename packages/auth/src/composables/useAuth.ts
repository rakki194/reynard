/**
 * Authentication Composable
 * Main authentication hook with state management and API integration
 */

import {
  createSignal,
  createEffect,
  createResource,
  onMount,
  onCleanup,
} from "solid-js";

import type {
  User,
  AuthState,
  AuthConfiguration,
  AuthCallbacks,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
  AuthTokens,
  ApiResponse,
} from "../types";
import {
  TokenManager,
  decodeToken,
  isTokenExpired,
  getUserFromToken,
  retryWithBackoff,
  generateCSRFToken,
} from "../utils";
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

  // Token manager instance
  const tokenManager = TokenManager.getInstance(
    config.tokenStorageKey,
    config.refreshTokenStorageKey,
  );

  // Auth state
  const [authState, setAuthState] = createSignal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isRefreshing: false,
  });

  // Auto-refresh timer
  let refreshTimer: number | null = null;

  // Update auth state helper
  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => {
      const newState = { ...prev, ...updates };
      callbacks.onAuthStateChange?.(newState);
      return newState;
    });
  };

  // API fetch wrapper with auth headers and CSRF protection
  const authFetch = async (
    url: string,
    options: {
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
      signal?: AbortSignal | null;
    } = {},
  ): Promise<Response> => {
    const token = tokenManager.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF protection for state-changing requests
    const method = options.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = generateCSRFToken();
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(`${config.apiBaseUrl}${url}`, {
      ...options,
      headers,
    });

    // Handle unauthorized responses
    if (response.status === 401) {
      if (token && config.autoRefresh) {
        try {
          await refreshTokens();
          // Retry the original request with new token
          const newToken = tokenManager.getAccessToken();
          if (newToken) {
            const retryHeaders: Record<string, string> = {
              "Content-Type": "application/json",
              ...(options.headers as Record<string, string>),
              Authorization: `Bearer ${newToken}`,
            };
            return fetch(`${config.apiBaseUrl}${url}`, {
              ...options,
              headers: retryHeaders,
            });
          }
        } catch (error) {
          await logout();
          callbacks.onUnauthorized?.();
          throw error;
        }
      } else {
        await logout();
        callbacks.onUnauthorized?.();
      }
    }

    return response;
  };

  // Parse API response
  const parseApiResponse = async <T>(
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

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${config.apiBaseUrl}${config.loginEndpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        },
      );

      const result = await parseApiResponse<AuthTokens & { user: User }>(
        response,
      );

      if (result.success && result.data) {
        const { user, accessToken, refreshToken } = result.data;

        // Store tokens
        tokenManager.setTokens(accessToken, refreshToken);

        // Update state
        updateAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Setup auto-refresh
        if (config.autoRefresh) {
          setupTokenRefresh();
        }

        // Trigger callbacks
        callbacks.onLoginSuccess?.(user, { accessToken, refreshToken });
      } else {
        const errorMessage = result.error || "Login failed";
        updateAuthState({
          isLoading: false,
          error: errorMessage,
        });
        callbacks.onLoginError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      updateAuthState({
        isLoading: false,
        error: errorMessage,
      });
      callbacks.onLoginError?.(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${config.apiBaseUrl}${config.registerEndpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = await parseApiResponse<{ user: User; message?: string }>(
        response,
      );

      if (result.success) {
        updateAuthState({
          isLoading: false,
          error: null,
        });

        // Optionally auto-login after registration
        if (result.data?.user) {
          await login({
            identifier: data.username,
            password: data.password,
          });
        }
      } else {
        const errorMessage = result.error || "Registration failed";
        updateAuthState({
          isLoading: false,
          error: errorMessage,
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      updateAuthState({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear tokens
      tokenManager.clearTokens();

      // Clear refresh timer
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }

      // Update state
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isRefreshing: false,
      });

      // Trigger callback
      callbacks.onLogout?.();

      // Optional API call to invalidate tokens on server
      try {
        await fetch(`${config.apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenManager.getAccessToken()}`,
          },
        });
      } catch (error) {
        // Ignore logout API errors
        console.warn("Logout API call failed:", error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Refresh tokens
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

  // Setup automatic token refresh using reactive effects
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

  // Change password
  const changePassword = async (data: PasswordChangeData): Promise<void> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const response = await authFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await parseApiResponse(response);

      if (result.success) {
        updateAuthState({ isLoading: false });
      } else {
        const errorMessage = result.error || "Password change failed";
        updateAuthState({
          isLoading: false,
          error: errorMessage,
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password change failed";
      updateAuthState({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  // Get current user profile
  const [userProfile] = createResource(
    () => authState().isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return null;

      try {
        const response = await authFetch(config.profileEndpoint!);
        const result = await parseApiResponse<User>(response);

        if (result.success && result.data) {
          updateAuthState({ user: result.data });
          return result.data;
        }

        return null;
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }
    },
  );

  // Update user profile
  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const response = await authFetch(config.profileEndpoint!, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      const result = await parseApiResponse<User>(response);

      if (result.success && result.data) {
        updateAuthState({
          user: result.data,
          isLoading: false,
        });
      } else {
        const errorMessage = result.error || "Profile update failed";
        updateAuthState({
          isLoading: false,
          error: errorMessage,
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Profile update failed";
      updateAuthState({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  // Initialize auth state
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
          userProfile();
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

  // Auto-initialize if enabled
  onMount(() => {
    if (options.autoInit !== false) {
      initialize();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
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
    login,
    register,
    logout,
    refreshTokens,
    changePassword,
    updateProfile,
    initialize,

    // Resources
    userProfile,

    // Utilities
    authFetch,
    tokenManager,
  };
}
