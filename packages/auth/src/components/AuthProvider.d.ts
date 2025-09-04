/**
 * Auth Provider Component
 * Context provider for authentication state and methods
 */
import { Component, ParentComponent } from "solid-js";
import type {
  AuthState,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
  User,
} from "../types";
import type { UseAuthOptions } from "../composables/useAuth";
export interface AuthContextValue {
  authState: () => AuthState;
  user: () => User | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  error: () => string | null;
  isRefreshing: () => boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}
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
export declare const AuthProvider: ParentComponent<AuthProviderProps>;
/**
 * Hook to access auth context
 */
export declare function useAuthContext(): AuthContextValue;
/**
 * Higher-order component to require authentication
 */
export declare function withAuth<T extends Record<string, any>>(
  WrappedComponent: Component<T>,
  options?: {
    fallback?: Component;
    redirectTo?: string;
  },
): Component<T>;
