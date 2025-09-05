/**
 * Auth Provider Component
 * Context provider for authentication state and methods
 */

import {
  Component,
  createContext,
  useContext,
  ParentComponent,
  createEffect,
} from "solid-js";
import { useAuth } from "../composables/useAuth";
import type {
  AuthState,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
  User,
} from "../types";
import type { UseAuthOptions } from "../composables/useAuth";

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
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;

  // Utilities
  authFetch: (
    url: string,
    options?: {
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
    },
  ) => Promise<Response>;
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

export const AuthProvider: ParentComponent<AuthProviderProps> = (props) => {
  const {
    children,
    fallback: Fallback,
    requireAuth = false,
    loginPath = "/login",
    ...authOptions
  } = props;

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
    updateProfile: auth.updateProfile,
    initialize: auth.initialize,

    // Utilities
    authFetch: auth.authFetch,
  };

  // Show loading fallback while initializing
  if (auth.isLoading() && Fallback) {
    return <Fallback />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
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
  } = {},
): Component<T> {
  return (props: T) => {
    const auth = useAuthContext();
    const { fallback: Fallback, redirectTo = "/login" } = options;

    createEffect(() => {
      if (!auth.isLoading() && !auth.isAuthenticated()) {
        if (typeof window !== "undefined") {
          window.location.href = redirectTo;
        }
      }
    });

    if (auth.isLoading()) {
      return Fallback ? <Fallback /> : <div>Loading...</div>;
    }

    if (!auth.isAuthenticated()) {
      return Fallback ? <Fallback /> : <div>Authentication required</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
