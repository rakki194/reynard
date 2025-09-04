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
  authFetch: (url: string, options?: {
    method?: string;
    headers?: Record<string, string> | Headers;
    body?: string | FormData | URLSearchParams | ReadableStream | null;
    credentials?: 'omit' | 'same-origin' | 'include';
    mode?: 'cors' | 'no-cors' | 'same-origin';
    cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
    redirect?: 'follow' | 'error' | 'manual';
    referrer?: string;
    referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal | null;
  }) => Promise<Response>;
  tokenManager: TokenManager;
};
