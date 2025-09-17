/**
 * Utility functions for Reynard API client
 */
export declare const createAuthFetch: (token: string) => (url: string, options?: RequestInit) => Promise<Response>;
export declare const handleApiError: (error: any) => never;
