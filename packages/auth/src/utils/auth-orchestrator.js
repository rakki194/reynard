/**
 * Authentication Orchestrator
 * Main orchestrator that sets up all auth modules and provides the main interface
 */
import { TokenManager } from "./token-utils";
import { createAuthFetch } from "./api-utils";
import { createAuthActions } from "./auth-actions";
import { createTokenRefreshManager } from "./token-refresh";
import { createUserProfileManager } from "./user-profile";
import { createAuthInitialization } from "./auth-initialization";
/**
 * Creates the main authentication orchestrator
 */
export const createAuthOrchestrator = (config, callbacks, authState, updateAuthState) => {
    // Token manager instance
    const tokenManager = TokenManager.getInstance(config.tokenStorageKey, config.refreshTokenStorageKey);
    // Create authenticated fetch function
    const authFetch = createAuthFetch(config, tokenManager, () => callbacks.onUnauthorized?.(), async () => {
        // Handle token refresh inline to avoid circular dependency
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new Error("No refresh token available");
        }
        updateAuthState({ isRefreshing: true });
        try {
            const response = await fetch(`${config.apiBaseUrl}${config.refreshEndpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });
            const result = await response.json();
            if (response.ok && result.accessToken) {
                const { accessToken, refreshToken: newRefreshToken } = result;
                tokenManager.setTokens(accessToken, newRefreshToken);
                updateAuthState({ isRefreshing: false });
                callbacks.onTokenRefresh?.(result);
            }
            else {
                throw new Error(result.error || "Token refresh failed");
            }
        }
        catch (error) {
            updateAuthState({ isRefreshing: false });
            throw error;
        }
    });
    // Create token refresh manager
    const tokenRefreshManager = createTokenRefreshManager(config, tokenManager, authState, updateAuthState, callbacks, async () => {
        // Simple logout implementation
        tokenManager.clearTokens();
        tokenRefreshManager.clearRefreshTimer();
        updateAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isRefreshing: false,
        });
        callbacks.onLogout?.();
    });
    // Create authentication actions
    const authActions = createAuthActions(config, tokenManager, authState, updateAuthState, callbacks, () => tokenRefreshManager.setupTokenRefresh(), authFetch);
    // Create user profile manager
    const userProfileManager = createUserProfileManager(config, authState, updateAuthState, authFetch);
    // Create authentication initialization
    const authInitialization = createAuthInitialization(config, tokenManager, authState, updateAuthState, callbacks, () => tokenRefreshManager.setupTokenRefresh(), () => userProfileManager.userProfile[0](), authActions.logout);
    return {
        authState,
        authActions,
        tokenRefreshManager,
        userProfileManager,
        authInitialization,
        authFetch,
        tokenManager,
    };
};
