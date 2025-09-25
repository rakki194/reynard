/**
 * Auth Provider Component
 * Context provider for authentication state and methods
 */

import { Component, createContext, useContext, ParentComponent, createEffect } from "solid-js";
import { useAuth } from "./useAuth";
import type { AuthState, LoginCredentials, RegisterData, PasswordChangeData, User } from "reynard-auth-core";
import type { UseAuthOptions } from "./useAuth";

export interface AuthContextValue {
  // State
  authState: () => AuthState;
  user: () => User | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  error: () => string | null;
  isRefreshing: () => boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
  initialize: () => Promise<void>;

  // Utilities
  tokenManager: any;
}

const AuthContext = createContext<AuthContextValue>();

export interface AuthProviderProps extends UseAuthOptions {
  /** Children components */
  children: any;
  /** Loading component while initializing */
  fallback?: Component;
  /** Redirect to login page when unauthenticated */
  requireAuth?: boolean;
  /** Login page path for redirects */
  loginPath?: string;
}

export const AuthProvider: ParentComponent<AuthProviderProps> = props => {
  const { children, fallback: Fallback, requireAuth = false, loginPath = "/login", ...authOptions } = props;

  const auth = useAuth({
    ...authOptions,
    autoInit: true,
  });

  // Handle auth redirects
  createEffect(() => {
    if (requireAuth && !auth.isLoading() && !auth.isAuthenticated()) {
      // In a real app, you would use your router here
      console.warn("Authentication required. Redirect to:", loginPath);
      if (typeof window !== "undefined") {
        window.location.href = loginPath;
      }
    }
  });

  const contextValue: AuthContextValue = {
    // State
    authState: auth.authState,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    isRefreshing: auth.isRefreshing,

    // Actions
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    refreshTokens: auth.refreshTokens,
    changePassword: auth.changePassword,
    initialize: auth.initialize,

    // Utilities
    tokenManager: auth.tokenManager,
  };

  // Show loading fallback while initializing
  if (auth.isLoading() && Fallback) {
    return <Fallback />;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

/**
 * Higher-order component to require authentication
 */
export function withAuth<T extends Record<string, any>>(
  WrappedComponent: Component<T>,
  options: {
    fallback?: Component;
    redirectTo?: string;
  } = {}
): Component<T> {
  return (props: T) => {
    const auth = useAuthContext();

    if (auth.isLoading()) {
      return options.fallback ? <options.fallback /> : <div>Loading...</div>;
    }

    if (!auth.isAuthenticated()) {
      if (options.redirectTo && typeof window !== "undefined") {
        window.location.href = options.redirectTo;
      }
      return options.fallback ? <options.fallback /> : <div>Authentication required</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
