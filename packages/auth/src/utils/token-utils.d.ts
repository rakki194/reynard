/**
 * Token utilities for the Reynard Auth system.
 *
 * This module contains JWT token management, validation, and
 * user information extraction functions.
 */
import type { DecodedToken, UserRole } from "../types";
/**
 * JWT Token utilities
 */
export declare class TokenManager {
    private static instance;
    private tokenKey;
    private refreshTokenKey;
    private blacklistedTokens;
    constructor(tokenKey?: string, refreshTokenKey?: string);
    static getInstance(tokenKey?: string, refreshTokenKey?: string): TokenManager;
    /**
     * Store tokens securely
     * Prefers sessionStorage for access tokens, localStorage for refresh tokens
     */
    setTokens(accessToken: string, refreshToken?: string): void;
    /**
     * Get access token from storage
     */
    getAccessToken(): string | null;
    /**
     * Get refresh token from storage
     */
    getRefreshToken(): string | null;
    /**
     * Remove tokens from storage
     */
    clearTokens(): void;
    /**
     * Check if access token exists
     */
    hasAccessToken(): boolean;
    /**
     * Check if refresh token exists
     */
    hasRefreshToken(): boolean;
    /**
     * Blacklist a token (revoke it)
     */
    blacklistToken(token: string): void;
    /**
     * Check if a token is blacklisted
     */
    isTokenBlacklisted(token: string): boolean;
    /**
     * Validate token format and expiration
     */
    validateToken(token: string): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Get token expiration time
     */
    getTokenExpiration(token: string): Date | null;
    /**
     * Check if token expires soon (within specified minutes)
     */
    isTokenExpiringSoon(token: string, minutes?: number): boolean;
    /**
     * Get token information without validation
     */
    getTokenInfo(token: string): DecodedToken | null;
    /**
     * Clean up expired blacklisted tokens
     */
    cleanupExpiredBlacklist(): void;
    /**
     * Get blacklist statistics
     */
    getBlacklistStats(): {
        total: number;
    };
}
/**
 * Decode JWT token safely with validation
 * WARNING: This only decodes the token, does not verify signature
 * For production use, always verify tokens server-side
 */
export declare function decodeToken(token: string): DecodedToken | null;
/**
 * Check if a token is expired
 */
export declare function isTokenExpired(token: string): boolean;
/**
 * Get user information from token
 */
export declare function getUserFromToken(token: string): {
    username?: string;
    role?: string;
} | null;
/**
 * Check if token has required role
 */
export declare function hasRequiredRole(token: string, requiredRole: UserRole): boolean;
/**
 * Check if token has any of the required roles
 */
export declare function hasAnyRequiredRole(token: string, requiredRoles: UserRole[]): boolean;
//# sourceMappingURL=token-utils.d.ts.map