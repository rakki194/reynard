/**
 * Authentication Composable
 * Main authentication hook with state management and API integration
 */
import type {
  User,
  AuthState,
  AuthConfiguration,
  AuthCallbacks,
  LoginCredentials,
  RegisterData,
  PasswordChangeData,
} from "../types";
import { TokenManager } from "../utils";
export interface UseAuthOptions {
  /** Authentication configuration */
  config?: Partial<AuthConfiguration>;
  /** Authentication callbacks */
  callbacks?: AuthCallbacks;
  /** Auto-initialize on mount */
  autoInit?: boolean;
}
export declare function useAuth(options?: UseAuthOptions): {
  authState: import("solid-js").Accessor<AuthState>;
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
  userProfile: import("solid-js").Resource<User | null>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  tokenManager: TokenManager;
};
