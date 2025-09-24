/**
 * Authentication Client
 * Core authentication operations using the HTTP client
 */

import type {
  User,
  AuthState,
  AuthConfiguration,
  AuthCallbacks,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
  AuthTokens,
} from "./types";
import { TokenManager } from "./token-manager";
import { HTTPClient } from "reynard-http-client";

export interface AuthClient {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
  refreshTokens: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

/**
 * Creates authentication client functions
 */
export const createAuthClient = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  _authState: () => AuthState,
  updateAuthState: (updates: Partial<AuthState>) => void,
  callbacks: AuthCallbacks
): AuthClient => {
  // Create HTTP client with auth middleware
  const httpClient = new HTTPClient({
    baseUrl: config.apiBaseUrl || "/api",
    timeout: 10000,
    retries: 2,
    middleware: [
      {
        request: (requestConfig) => {
          const token = tokenManager.getAccessToken();
          if (token) {
            requestConfig.headers = {
              ...requestConfig.headers,
              Authorization: `Bearer ${token}`,
            };
          }
          return requestConfig;
        },
        error: async (error) => {
          // Handle 401 errors with token refresh
          if (error.status === 401) {
            try {
              await refreshTokens();
              // Retry the original request
              return error;
            } catch (refreshError) {
              callbacks.onUnauthorized?.();
              throw refreshError;
            }
          }
          return error;
        },
      },
    ],
  });

  const login = async (credentials: LoginCredentials): Promise<void> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const response = await httpClient.post<AuthTokens & { user: User }>(
        config.loginEndpoint || "/auth/login",
        credentials
      );

      if (response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Store tokens
        tokenManager.setTokens(accessToken, refreshToken);

        // Update state
        updateAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Trigger callbacks
        callbacks.onLoginSuccess?.(user, { accessToken, refreshToken });
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      updateAuthState({
        isLoading: false,
        error: errorMessage,
      });
      callbacks.onLoginError?.(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const response = await httpClient.post<{ user: User; message?: string }>(
        config.registerEndpoint || "/auth/register",
        data
      );

      if (response.data) {
        updateAuthState({
          isLoading: false,
          error: null,
        });

        // Optionally auto-login after registration
        if (response.data.user) {
          await login({
            identifier: data.username,
            password: data.password,
          });
        }
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      updateAuthState({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear tokens
      tokenManager.clearTokens();

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
        await httpClient.post("/auth/logout");
      } catch (error) {
        // Ignore logout API errors
        console.warn("Logout API call failed:", error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const changePassword = async (data: PasswordChangeData): Promise<void> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const response = await httpClient.post("/auth/change-password", data);

      if (response.status < 400) {
        updateAuthState({ isLoading: false });
      } else {
        throw new Error("Password change failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Password change failed";
      updateAuthState({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const refreshTokens = async (): Promise<void> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    updateAuthState({ isRefreshing: true });

    try {
      const response = await httpClient.post<AuthTokens>(
        config.refreshEndpoint || "/auth/refresh",
        { refreshToken }
      );

      if (response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        tokenManager.setTokens(accessToken, newRefreshToken);
        updateAuthState({ isRefreshing: false });
        callbacks.onTokenRefresh?.(response.data);
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      updateAuthState({ isRefreshing: false });
      callbacks.onSessionExpired?.();
      throw error;
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await httpClient.get<User>(config.profileEndpoint || "/auth/profile");
      return response.data || null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  };

  return {
    login,
    register,
    logout,
    changePassword,
    refreshTokens,
    getCurrentUser,
  };
};
