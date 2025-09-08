/**
 * Security utilities for the Reynard Auth system.
 *
 * This module contains security-focused utility functions including
 * input sanitization, CSRF protection, and secure string generation.
 */
/**
 * Comprehensive input sanitization for security
 */
export function sanitizeInput(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    return input
        .trim()
        // Remove HTML tags and entities
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, '')
        // Remove dangerous protocols
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/file:/gi, '')
        .replace(/ftp:/gi, '')
        // Remove event handlers
        .replace(/on\w+\s*=/gi, '')
        // Remove script tags and content
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        // Remove style tags and content
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        // Remove dangerous characters
        .replace(/[<>'"&]/g, '')
        // Remove control characters (except newlines and tabs)
        .split('').filter(char => {
        const code = char.charCodeAt(0);
        return code >= 32 || code === 9 || code === 10 || code === 13;
    }).join('')
        // Limit length to prevent buffer overflow
        .substring(0, 10000);
}
/**
 * Generate secure random string using crypto API when available
 */
export function generateSecureString(length = 32) {
    // Use crypto.getRandomValues if available (more secure)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    // Fallback to Math.random (less secure but functional)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
    return generateSecureString(32);
}
/**
 * Validate CSRF token
 */
export function validateCSRFToken(token, expectedToken) {
    if (!token || !expectedToken) {
        return false;
    }
    // Use constant-time comparison to prevent timing attacks
    if (token.length !== expectedToken.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    return result === 0;
}
/**
 * Rate limiting utility
 */
export class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.requests = new Map();
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    isAllowed(identifier) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, [now]);
            return true;
        }
        const requests = this.requests.get(identifier);
        const recentRequests = requests.filter((time) => time > windowStart);
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);
        return true;
    }
    cleanup() {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        for (const [identifier, requests] of this.requests.entries()) {
            const recentRequests = requests.filter((time) => time > windowStart);
            if (recentRequests.length === 0) {
                this.requests.delete(identifier);
            }
            else {
                this.requests.set(identifier, recentRequests);
            }
        }
    }
}
