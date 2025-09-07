/**
 * Authentication Actions
 * Core authentication operations: login, register, logout, password change
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
} from "../types";
import { TokenManager, retryWithBackoff } from "./token-utils";
import { createAuthFetch, parseApiResponse } from "./api-utils";

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
}

/**
 * Creates authentication action functions
 */
export const createAuthActions = (
  config: AuthConfiguration,
  tokenManager: TokenManager,
  authState: () => AuthState,
  updateAuthState: (updates: Partial<AuthState>) => void,
  callbacks: AuthCallbacks,
  setupTokenRefresh: () => void,
  authFetch: ReturnType<typeof createAuthFetch>
): AuthActions => {
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

  return {
    login,
    register,
    logout,
    changePassword,
  };
};
