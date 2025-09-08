/**
 * Authentication Retry Logic
 * Handles token refresh and request retry for unauthorized responses
 */
import type { AuthConfiguration } from "../types";
import type { TokenManager } from "./token-utils";
import type { AuthFetchOptions } from "./api-utils";
export interface RetryConfig {
    config: AuthConfiguration;
    tokenManager: TokenManager;
    onUnauthorized: () => void;
    onTokenRefresh: () => Promise<void>;
}
/**
 * Handles unauthorized response with token refresh and retry
 */
export declare const handleUnauthorizedResponse: (url: string, options: AuthFetchOptions, retryConfig: RetryConfig) => Promise<Response | null>;
//# sourceMappingURL=auth-retry.d.ts.map