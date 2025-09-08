/**
 * Authentication Initialization
 * Handles initial auth state setup and token validation
 */
import { isTokenExpired, getUserFromToken } from "./token-utils";
/**
 * Creates authentication initialization functions
 */
export const createAuthInitialization = (config, tokenManager, authState, updateAuthState, callbacks, setupTokenRefresh, fetchUserProfile, logout) => {
    const initialize = async () => {
        updateAuthState({ isLoading: true });
        try {
            const token = tokenManager.getAccessToken();
            if (token && !isTokenExpired(token)) {
                const userInfo = getUserFromToken(token);
                if (userInfo) {
                    updateAuthState({
                        user: userInfo,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    // Setup auto-refresh
                    if (config.autoRefresh) {
                        setupTokenRefresh();
                    }
                    // Fetch full user profile
                    fetchUserProfile();
                }
                else {
                    await logout();
                }
            }
            else {
                await logout();
            }
        }
        catch (error) {
            console.error("Auth initialization error:", error);
            await logout();
        }
        updateAuthState({ isLoading: false });
    };
    return {
        initialize,
    };
};
