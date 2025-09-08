/**
 * Security utilities for the Reynard Auth system.
 *
 * This module contains security-focused utility functions including
 * input sanitization, CSRF protection, and secure string generation.
 */
/**
 * Comprehensive input sanitization for security
 */
export declare function sanitizeInput(input: string): string;
/**
 * Generate secure random string using crypto API when available
 */
export declare function generateSecureString(length?: number): string;
/**
 * Generate CSRF token
 */
export declare function generateCSRFToken(): string;
/**
 * Validate CSRF token
 */
export declare function validateCSRFToken(token: string, expectedToken: string): boolean;
/**
 * Rate limiting utility
 */
export declare class RateLimiter {
    private requests;
    private maxRequests;
    private windowMs;
    constructor(maxRequests?: number, windowMs?: number);
    isAllowed(identifier: string): boolean;
    cleanup(): void;
}
//# sourceMappingURL=security-utils.d.ts.map