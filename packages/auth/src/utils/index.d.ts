/**
 * Authentication Utilities
 * Helper functions for auth operations, validation, and token management
 */
import type {
  DecodedToken,
  PasswordStrength,
  ValidationRules,
  User,
  UserRole,
} from "../types";
/**
 * JWT Token utilities
 */
export declare class TokenManager {
  private static instance;
  private tokenKey;
  private refreshTokenKey;
  constructor(tokenKey?: string, refreshTokenKey?: string);
  static getInstance(tokenKey?: string, refreshTokenKey?: string): TokenManager;
  /**
   * Store tokens in localStorage
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
}
/**
 * Decode JWT token safely
 */
export declare function decodeToken(token: string): DecodedToken | null;
/**
 * Check if token is expired
 */
export declare function isTokenExpired(
  token: string,
  bufferMinutes?: number,
): boolean;
/**
 * Get time until token expires
 */
export declare function getTokenTimeToExpiry(token: string): number;
/**
 * Extract user info from token
 */
export declare function getUserFromToken(token: string): Partial<User> | null;
/**
 * Password validation utilities
 */
export declare function validatePassword(
  password: string,
  rules?: ValidationRules,
): {
  isValid: boolean;
  errors: string[];
};
/**
 * Calculate password strength using basic heuristics
 */
export declare function calculatePasswordStrength(
  password: string,
): PasswordStrength;
/**
 * Validate email address
 */
export declare function validateEmail(email: string): boolean;
/**
 * Validate username
 */
export declare function validateUsername(
  username: string,
  rules?: ValidationRules,
): boolean;
/**
 * Generate secure random string
 */
export declare function generateSecureString(length?: number): string;
/**
 * Hash password (for client-side hashing before transmission)
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Create authorization header
 */
export declare function createAuthHeader(
  token: string,
  type?: string,
): Record<string, string>;
/**
 * Parse user role and check permissions
 */
export declare function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean;
/**
 * Format user display name
 */
export declare function formatUserDisplayName(user: Partial<User>): string;
/**
 * Get user initials for avatar
 */
export declare function getUserInitials(user: Partial<User>): string;
/**
 * Sanitize user input
 */
export declare function sanitizeInput(input: string): string;
/**
 * Generate avatar URL from email (Gravatar)
 */
export declare function generateAvatarUrl(email: string, size?: number): string;
/**
 * Debounce function for API calls
 */
export declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void;
/**
 * Retry async operation with exponential backoff
 */
export declare function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts?: number,
  baseDelay?: number,
): Promise<T>;
/**
 * Check if code is running in browser
 */
export declare function isBrowser(): boolean;
/**
 * Secure storage for sensitive data
 */
export declare class SecureStorage {
  private prefix;
  constructor(prefix?: string);
  set(key: string, value: string): void;
  get(key: string): string | null;
  remove(key: string): void;
  clear(): void;
}
