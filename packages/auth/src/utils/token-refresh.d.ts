/**
 * Token Refresh Management
 * Handles automatic token refresh and session management
 */
import type { AuthState, AuthConfiguration, AuthCallbacks } from "../types";
import { TokenManager } from "./token-utils";
export interface TokenRefreshManager {
    refreshTokens: () => Promise<void>;
    setupTokenRefresh: () => void;
    clearRefreshTimer: () => void;
}
/**
 * Creates token refresh management functions
 */
export declare const createTokenRefreshManager: (config: AuthConfiguration, tokenManager: TokenManager, authState: () => AuthState, updateAuthState: (updates: Partial<AuthState>) => void, callbacks: AuthCallbacks, logout: () => Promise<void>) => TokenRefreshManager;
//# sourceMappingURL=token-refresh.d.ts.map