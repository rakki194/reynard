import { SecurityLevel } from "./types";
export class ConnectionSecurity {
    constructor(level = SecurityLevel.BASIC) {
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: level
        });
    }
    createAuthorizationHeaders(token, apiKey) {
        const headers = {};
        if (token)
            headers["Authorization"] = `Bearer ${token}`;
        if (apiKey)
            headers["X-API-Key"] = apiKey;
        return headers;
    }
    // Frontend placeholder: crypto-level settings are handled by browser
    getSecurityInfo() {
        return {
            security_level: this.level,
            tls_managed_by_browser: true,
        };
    }
}
