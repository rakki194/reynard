/**
 * Token utilities for the Reynard Auth system.
 * 
 * This module contains JWT token management, validation, and
 * user information extraction functions.
 */

import { jwtDecode } from "jwt-decode";
import type { DecodedToken, UserRole } from "../types";

/**
 * JWT Token utilities
 */
export class TokenManager {
  private static instance: TokenManager;
  private tokenKey: string;
  private refreshTokenKey: string;
  private blacklistedTokens: Set<string> = new Set();

  constructor(tokenKey = "auth_token", refreshTokenKey = "refresh_token") {
    this.tokenKey = tokenKey;
    this.refreshTokenKey = refreshTokenKey;
  }

  static getInstance(
    tokenKey?: string,
    refreshTokenKey?: string,
  ): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager(tokenKey, refreshTokenKey);
    }
    return TokenManager.instance;
  }

  /**
   * Store tokens securely
   * Prefers sessionStorage for access tokens, localStorage for refresh tokens
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === "undefined") return;

    try {
      // Store access token in sessionStorage (more secure, cleared on tab close)
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(this.tokenKey, accessToken);
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.tokenKey, accessToken);
      }
      
      // Store refresh token in localStorage (persists across sessions)
      if (refreshToken && typeof localStorage !== "undefined") {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
    } catch (error) {
      // Handle storage quota exceeded or other errors
      console.warn("Failed to store tokens:", error);
    }
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    
    try {
      // Try sessionStorage first, then localStorage
      if (typeof sessionStorage !== "undefined") {
        const token = sessionStorage.getItem(this.tokenKey);
        if (token) return token;
      }
      
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(this.tokenKey);
      }
    } catch (error) {
      console.warn("Failed to retrieve access token:", error);
    }
    
    return null;
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Remove tokens from storage
   */
  clearTokens(): void {
    if (typeof window === "undefined") return;

    try {
      // Clear from both sessionStorage and localStorage
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(this.tokenKey);
      }
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
      }
    } catch (error) {
      console.warn("Failed to clear tokens:", error);
    }
  }

  /**
   * Check if access token exists
   */
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if refresh token exists
   */
  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Blacklist a token (revoke it)
   */
  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  /**
   * Check if a token is blacklisted
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Validate token format and expiration
   */
  validateToken(token: string): { isValid: boolean; error?: string } {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        return { isValid: false, error: "Token has been revoked" };
      }

      // Check expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return { isValid: false, error: "Token has expired" };
      }

      // Check required fields
      if (!decoded.sub || !decoded.role) {
        return { isValid: false, error: "Token missing required fields" };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: "Invalid token format" };
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token expires soon (within specified minutes)
   */
  isTokenExpiringSoon(token: string, minutes: number = 5): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;

    const now = new Date();
    const timeUntilExpiry = expiration.getTime() - now.getTime();
    const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);

    return minutesUntilExpiry <= minutes;
  }

  /**
   * Get token information without validation
   */
  getTokenInfo(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  /**
   * Clean up expired blacklisted tokens
   */
  cleanupExpiredBlacklist(): void {
    const now = Date.now();
    for (const token of this.blacklistedTokens) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp && decoded.exp * 1000 < now) {
          this.blacklistedTokens.delete(token);
        }
      } catch {
        // Invalid token, remove it
        this.blacklistedTokens.delete(token);
      }
    }
  }

  /**
   * Get blacklist statistics
   */
  getBlacklistStats(): { total: number } {
    return { total: this.blacklistedTokens.size };
  }
}

/**
 * Decode JWT token safely with validation
 * WARNING: This only decodes the token, does not verify signature
 * For production use, always verify tokens server-side
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    // Basic format validation
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    // Check JWT format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode without verification (client-side only)
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Validate required fields
    if (!decoded || !decoded.sub || !decoded.role) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Don't log sensitive token information
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp) {
      return decoded.exp * 1000 < Date.now();
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Get user information from token
 */
export function getUserFromToken(
  token: string,
): { username?: string; role?: string } | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      username: decoded.sub,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Check if token has required role
 */
export function hasRequiredRole(
  token: string,
  requiredRole: UserRole,
): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.role === requiredRole;
  } catch {
    return false;
  }
}

/**
 * Check if token has any of the required roles
 */
export function hasAnyRequiredRole(
  token: string,
  requiredRoles: UserRole[],
): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return requiredRoles.includes(decoded.role as UserRole);
  } catch {
    return false;
  }
}
