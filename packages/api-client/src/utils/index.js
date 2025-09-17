/**
 * Utility functions for Reynard API client
 */
export const createAuthFetch = (token) => {
    return async (url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });
    };
};
export const handleApiError = (error) => {
    console.error("API Error:", error);
    throw new Error(error.message || "An API error occurred");
};
