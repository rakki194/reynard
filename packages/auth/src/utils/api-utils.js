/**
 * API Utilities for Authentication
 * Handles authenticated requests, CSRF protection, and response parsing
 */
import { buildAuthHeaders } from "./auth-headers";
import { handleUnauthorizedResponse } from "./auth-retry";
/**
 * Creates an authenticated fetch function with CSRF protection
 */
export const createAuthFetch = (config, tokenManager, onUnauthorized, onTokenRefresh) => {
    return async (url, options = {}) => {
        const token = tokenManager.getAccessToken();
        const headers = buildAuthHeaders({ token: token || undefined, options });
        const response = await fetch(`${config.apiBaseUrl}${url}`, {
            ...options,
            headers,
        });
        // Handle unauthorized responses
        if (response.status === 401) {
            const retryResponse = await handleUnauthorizedResponse(url, options, { config, tokenManager, onUnauthorized, onTokenRefresh });
            if (retryResponse) {
                return retryResponse;
            }
        }
        return response;
    };
};
/**
 * Parse API response into standardized format
 */
export const parseApiResponse = async (response) => {
    try {
        const data = await response.json();
        return {
            data: response.ok ? data : undefined,
            error: response.ok
                ? undefined
                : data.message || data.detail || "Request failed",
            success: response.ok,
            status: response.status,
            meta: {
                timestamp: new Date().toISOString(),
            },
        };
    }
    catch {
        return {
            error: "Failed to parse response",
            success: false,
            status: response.status,
            meta: {
                timestamp: new Date().toISOString(),
            },
        };
    }
};
