/**
 * Utility functions for Reynard API client
 */

export const createAuthFetch = (token: string) => {
  return async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };
};

export const handleApiError = (error: any) => {
  console.error("API Error:", error);
  throw new Error(error.message || "An API error occurred");
};
