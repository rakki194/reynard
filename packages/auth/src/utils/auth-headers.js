/**
 * Authentication Header Utilities
 * Handles header construction for authenticated requests
 */
import { generateCSRFToken } from "./token-utils";
/**
 * Builds headers for authenticated requests
 */
export const buildAuthHeaders = (config) => {
    const headers = {
        "Content-Type": "application/json",
        ...config.options.headers,
    };
    if (config.token) {
        headers.Authorization = `Bearer ${config.token}`;
    }
    // Add CSRF protection for state-changing requests
    const method = config.options.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        headers['X-CSRF-Token'] = generateCSRFToken();
    }
    return headers;
};
