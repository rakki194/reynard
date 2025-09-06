import { SecurityLevel } from './types';

export class ConnectionSecurity {
  constructor(public level: SecurityLevel = SecurityLevel.BASIC) {}

  createAuthorizationHeaders(token?: string, apiKey?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (apiKey) headers['X-API-Key'] = apiKey;
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
