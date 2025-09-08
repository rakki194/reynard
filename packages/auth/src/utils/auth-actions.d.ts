/**
 * Authentication Actions
 * Core authentication operations: login, register, logout, password change
 */
import type { AuthState, AuthConfiguration, AuthCallbacks, LoginCredentials, RegisterData, PasswordChangeData } from "../types";
import { TokenManager } from "./token-utils";
import { createAuthFetch } from "./api-utils";
export interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (data: PasswordChangeData) => Promise<void>;
}
/**
 * Creates authentication action functions
 */
export declare const createAuthActions: (config: AuthConfiguration, tokenManager: TokenManager, authState: () => AuthState, updateAuthState: (updates: Partial<AuthState>) => void, callbacks: AuthCallbacks, setupTokenRefresh: () => void, authFetch: ReturnType<typeof createAuthFetch>) => AuthActions;
//# sourceMappingURL=auth-actions.d.ts.map