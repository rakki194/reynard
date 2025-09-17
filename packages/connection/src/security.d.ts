import { SecurityLevel } from "./types";
export declare class ConnectionSecurity {
    level: SecurityLevel;
    constructor(level?: SecurityLevel);
    createAuthorizationHeaders(token?: string, apiKey?: string): Record<string, string>;
    getSecurityInfo(): {
        security_level: SecurityLevel;
        tls_managed_by_browser: boolean;
    };
}
