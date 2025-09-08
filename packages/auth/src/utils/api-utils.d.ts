/**
 * API Utilities for Authentication
 * Handles authenticated requests, CSRF protection, and response parsing
 */
import type { ApiResponse, AuthConfiguration } from "../types";
import type { TokenManager } from "./token-utils";
export interface AuthFetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string | FormData | URLSearchParams | ReadableStream | null;
    credentials?: "omit" | "same-origin" | "include";
    mode?: "cors" | "no-cors" | "same-origin";
    cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
    redirect?: "follow" | "error" | "manual";
    referrer?: string;
    referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    integrity?: string;
    keepalive?: boolean;
    signal?: globalThis.AbortSignal | null;
}
/**
 * Creates an authenticated fetch function with CSRF protection
 */
export declare const createAuthFetch: (config: AuthConfiguration, tokenManager: TokenManager, onUnauthorized: () => void, onTokenRefresh: () => Promise<void>) => (url: string, options?: AuthFetchOptions) => Promise<Response>;
/**
 * Parse API response into standardized format
 */
export declare const parseApiResponse: <T>(response: Response) => Promise<ApiResponse<T>>;
//# sourceMappingURL=api-utils.d.ts.map