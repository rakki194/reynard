/**
 * Authentication Initialization
 * Handles initial auth state setup and token validation
 */
import type { AuthState, AuthConfiguration, AuthCallbacks } from "../types";
import { TokenManager } from "./token-utils";
export interface AuthInitialization {
    initialize: () => Promise<void>;
}
/**
 * Creates authentication initialization functions
 */
export declare const createAuthInitialization: (config: AuthConfiguration, tokenManager: TokenManager, authState: () => AuthState, updateAuthState: (updates: Partial<AuthState>) => void, callbacks: AuthCallbacks, setupTokenRefresh: () => void, fetchUserProfile: () => void, logout: () => Promise<void>) => AuthInitialization;
//# sourceMappingURL=auth-initialization.d.ts.map