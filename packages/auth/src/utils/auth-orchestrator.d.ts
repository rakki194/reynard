/**
 * Authentication Orchestrator
 * Main orchestrator that sets up all auth modules and provides the main interface
 */
import type { AuthState, AuthConfiguration, AuthCallbacks } from "../types";
import { TokenManager } from "./token-utils";
import { createAuthFetch } from "./api-utils";
import { createAuthActions } from "./auth-actions";
import { createTokenRefreshManager } from "./token-refresh";
import { createUserProfileManager } from "./user-profile";
import { createAuthInitialization } from "./auth-initialization";
export interface AuthOrchestrator {
    authState: () => AuthState;
    authActions: ReturnType<typeof createAuthActions>;
    tokenRefreshManager: ReturnType<typeof createTokenRefreshManager>;
    userProfileManager: ReturnType<typeof createUserProfileManager>;
    authInitialization: ReturnType<typeof createAuthInitialization>;
    authFetch: ReturnType<typeof createAuthFetch>;
    tokenManager: TokenManager;
}
/**
 * Creates the main authentication orchestrator
 */
export declare const createAuthOrchestrator: (config: AuthConfiguration, callbacks: AuthCallbacks, authState: () => AuthState, updateAuthState: (updates: Partial<AuthState>) => void) => AuthOrchestrator;
//# sourceMappingURL=auth-orchestrator.d.ts.map