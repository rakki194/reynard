/**
 * Authentication Utilities
 * Helper functions for auth operations, validation, and token management
 */
import { jwtDecode } from "jwt-decode";
import { DEFAULT_VALIDATION_RULES } from "../types";
/**
 * JWT Token utilities
 */
export class TokenManager {
  constructor(tokenKey = "auth_token", refreshTokenKey = "refresh_token") {
    Object.defineProperty(this, "tokenKey", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, "refreshTokenKey", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.tokenKey = tokenKey;
    this.refreshTokenKey = refreshTokenKey;
  }
  static getInstance(tokenKey, refreshTokenKey) {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager(tokenKey, refreshTokenKey);
    }
    return TokenManager.instance;
  }
  /**
   * Store tokens in localStorage
   */
  setTokens(accessToken, refreshToken) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(this.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }
  /**
   * Get access token from storage
   */
  getAccessToken() {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }
  /**
   * Get refresh token from storage
   */
  getRefreshToken() {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(this.refreshTokenKey);
  }
  /**
   * Remove tokens from storage
   */
  clearTokens() {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
  /**
   * Check if access token exists
   */
  hasAccessToken() {
    return !!this.getAccessToken();
  }
  /**
   * Check if refresh token exists
   */
  hasRefreshToken() {
    return !!this.getRefreshToken();
  }
}
/**
 * Decode JWT token safely
 */
export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.warn("Failed to decode token:", error);
    return null;
  }
}
/**
 * Check if token is expired
 */
export function isTokenExpired(token, bufferMinutes = 5) {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  const now = Date.now() / 1000;
  const buffer = bufferMinutes * 60;
  return decoded.exp <= now + buffer;
}
/**
 * Get time until token expires
 */
export function getTokenTimeToExpiry(token) {
  const decoded = decodeToken(token);
  if (!decoded) return 0;
  const now = Date.now() / 1000;
  return Math.max(0, decoded.exp - now);
}
/**
 * Extract user info from token
 */
export function getUserFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return {
    id: decoded.sub,
    role: decoded.role,
  };
}
/**
 * Password validation utilities
 */
export function validatePassword(password, rules = DEFAULT_VALIDATION_RULES) {
  const errors = [];
  if (rules.minLength && password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  }
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (rules.requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (
    rules.requireSpecialChar &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  }
  if (rules.customPattern && !rules.customPattern.test(password)) {
    errors.push("Password does not meet custom requirements");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}
/**
 * Calculate password strength using basic heuristics
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      isValid: false,
      feedback: "Password is required",
      suggestions: ["Enter a password"],
    };
  }
  let score = 0;
  const suggestions = [];
  // Length check
  if (password.length >= 8) score += 1;
  else suggestions.push("Make it at least 8 characters");
  if (password.length >= 12) score += 1;
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push("Add lowercase letters");
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push("Add uppercase letters");
  if (/\d/.test(password)) score += 1;
  else suggestions.push("Add numbers");
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else suggestions.push("Add special characters");
  // Reduce score for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1; // Sequential patterns
  // Normalize score to 0-4 range
  score = Math.max(0, Math.min(4, Math.floor(score / 1.5)));
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return {
    score,
    isValid: score >= 2,
    feedback: strengthLabels[score],
    suggestions,
    crackTime: estimateCrackTime(password, score),
  };
}
/**
 * Estimate password crack time
 */
function estimateCrackTime(password, score) {
  const times = [
    "less than a second",
    "a few seconds",
    "a few minutes",
    "a few hours",
    "centuries",
  ];
  return times[score] || "unknown";
}
/**
 * Validate email address
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
/**
 * Validate username
 */
export function validateUsername(username, rules = DEFAULT_VALIDATION_RULES) {
  if (!rules.usernamePattern) return username.length >= 3;
  return rules.usernamePattern.test(username);
}
/**
 * Generate secure random string
 */
export function generateSecureString(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}
/**
 * Hash password (for client-side hashing before transmission)
 */
export async function hashPassword(password) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API not available");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
/**
 * Create authorization header
 */
export function createAuthHeader(token, type = "Bearer") {
  return {
    Authorization: `${type} ${token}`,
  };
}
/**
 * Parse user role and check permissions
 */
export function hasPermission(userRole, requiredRole) {
  const roleHierarchy = {
    guest: 0,
    user: 1,
    moderator: 2,
    admin: 3,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
/**
 * Format user display name
 */
export function formatUserDisplayName(user) {
  if (user.fullName) return user.fullName;
  if (user.username) return user.username;
  if (user.email) return user.email.split("@")[0];
  return "Unknown User";
}
/**
 * Get user initials for avatar
 */
export function getUserInitials(user) {
  const name = formatUserDisplayName(user);
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, ""); // Remove quotes
}
/**
 * Generate avatar URL from email (Gravatar)
 */
export function generateAvatarUrl(email, size = 80) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&size=${size}`;
  }
  // Would use crypto.subtle.digest for MD5 hash for Gravatar
  // For now, return a placeholder
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&size=${size}`;
}
/**
 * Debounce function for API calls
 */
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff(
  operation,
  maxAttempts = 3,
  baseDelay = 1000,
) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
/**
 * Check if code is running in browser
 */
export function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}
/**
 * Secure storage for sensitive data
 */
export class SecureStorage {
  constructor(prefix = "auth_") {
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.prefix = prefix;
  }
  set(key, value) {
    if (!isBrowser()) return;
    try {
      // In a real implementation, you might encrypt the value
      localStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.warn("Failed to store secure data:", error);
    }
  }
  get(key) {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(this.prefix + key);
    } catch (error) {
      console.warn("Failed to retrieve secure data:", error);
      return null;
    }
  }
  remove(key) {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("Failed to remove secure data:", error);
    }
  }
  clear() {
    if (!isBrowser()) return;
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.prefix),
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear secure data:", error);
    }
  }
}
