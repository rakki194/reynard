/**
 * Authentication Utilities
 * Helper functions for auth operations, validation, and token management
 */

import { jwtDecode } from "jwt-decode";
import type {
  DecodedToken,
  PasswordStrength,
  ValidationRules,
  UserRole,
} from "../types";
import { DEFAULT_VALIDATION_RULES } from "../types";

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
   * Store tokens in localStorage
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof localStorage === "undefined") return;

    localStorage.setItem(this.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
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
    if (typeof localStorage === "undefined") return;

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
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
 * Decode JWT token safely
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.warn("Failed to decode token:", error);
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

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  rules: ValidationRules = DEFAULT_VALIDATION_RULES,
): PasswordStrength {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (rules.minLength && password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  } else if (rules.minLength && password.length >= rules.minLength) {
    score += 1;
  }

  // Uppercase check
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // Lowercase check
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (/[a-z]/.test(password)) {
    score += 1;
  }

  // Number check
  if (rules.requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (/\d/.test(password)) {
    score += 1;
  }

  // Special character check
  if (
    rules.requireSpecialChar &&
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  }
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  }

  // Determine strength level
  let strength: "weak" | "medium" | "strong" | "very-strong";
  if (score <= 2) strength = "weak";
  else if (score <= 3) strength = "medium";
  else if (score <= 4) strength = "strong";
  else strength = "very-strong";

  return {
    isValid: errors.length === 0,
    score,
    feedback: strength,
    suggestions: errors,
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Sanitize user input for security
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

/**
 * Generate secure random string
 */
export function generateSecureString(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }

    const requests = this.requests.get(identifier)!;
    const recentRequests = requests.filter((time) => time > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter((time) => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}
