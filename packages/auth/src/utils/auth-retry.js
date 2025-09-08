/**
 * Authentication Retry Logic
 * Handles token refresh and request retry for unauthorized responses
 */
import { buildAuthHeaders } from "./auth-headers";
/**
 * Handles unauthorized response with token refresh and retry
 */
export const handleUnauthorizedResponse = async (url, options, retryConfig) => {
    const { config, tokenManager, onUnauthorized, onTokenRefresh } = retryConfig;
    const token = tokenManager.getAccessToken();
    if (!token || !config.autoRefresh) {
        onUnauthorized();
        return null;
    }
    try {
        await onTokenRefresh();
        // Retry the original request with new token
        const newToken = tokenManager.getAccessToken();
        if (newToken) {
            const retryHeaders = buildAuthHeaders({
                token: newToken,
                options,
            });
            return fetch(`${config.apiBaseUrl}${url}`, {
                ...options,
                headers: retryHeaders,
            });
        }
    }
    catch (error) {
        onUnauthorized();
        throw error;
    }
    return null;
};
