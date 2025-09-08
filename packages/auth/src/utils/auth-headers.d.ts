/**
 * Authentication Header Utilities
 * Handles header construction for authenticated requests
 */
import type { AuthFetchOptions } from "./api-utils";
export interface HeaderConfig {
    token?: string;
    options: AuthFetchOptions;
}
/**
 * Builds headers for authenticated requests
 */
export declare const buildAuthHeaders: (config: HeaderConfig) => Record<string, string>;
//# sourceMappingURL=auth-headers.d.ts.map