/**
 * Cryptographic Utilities
 * Secure random number generation and cryptographic functions
 */

import { i18n } from "reynard-i18n";

/**
 * Generate cryptographically secure random bytes
 */
export function generateSecureBytes(length: number): Uint8Array {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("Crypto API not available");
  }

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Generate cryptographically secure random string
 */
export function generateSecureString(
  length: number = 32,
  charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
): string {
  if (charset.length === 0) {
    return ""; // Return empty string for empty charset
  }

  try {
    const bytes = generateSecureBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }

    return result;
  } catch (error) {
    // Fallback to Math.random when crypto is not available
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
  }
}

/**
 * Generate secure random hex string
 */
export function generateSecureHex(length: number = 32): string {
  const bytes = generateSecureBytes(Math.ceil(length / 2));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, length);
}

/**
 * Generate secure random base64 string
 */
export function generateSecureBase64(length: number = 32): string {
  const bytes = generateSecureBytes(length);
  return btoa(String.fromCharCode(...bytes)).substring(0, length);
}

/**
 * Hash a string using Web Crypto API
 */
export async function hashString(
  input: string,
  algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256",
): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API not available");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a secure UUID v4
 */
export function generateSecureUUID(): string {
  const bytes = generateSecureBytes(16);

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join("-");
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a secure nonce for CSP
 */
export function generateNonce(): string {
  return generateSecureHex(32);
}

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureHex(64);
}

/**
 * Validate CSRF token with constant-time comparison
 */
export function validateCSRFToken(
  token: string,
  expectedToken: string,
): boolean {
  if (!token && !expectedToken) {
    return true; // Both empty strings are equal
  }
  if (!token || !expectedToken) {
    return false;
  }
  return constantTimeCompare(token, expectedToken);
}

/**
 * Generate a secure session ID
 */
export function generateSessionID(): string {
  return generateSecureHex(128);
}

/**
 * Generate a secure API key
 */
export function generateAPIKey(prefix: string = "rk"): string {
  const randomPart = generateSecureHex(64);
  return `${prefix}_${randomPart}`;
}

/**
 * Generate a secure password reset token
 */
export function generatePasswordResetToken(): string {
  return generateSecureHex(64);
}

/**
 * Generate a secure email verification token
 */
export function generateEmailVerificationToken(): string {
  return generateSecureHex(64);
}

/**
 * Secure random number between min and max (inclusive)
 */
export function secureRandomInt(min: number, max: number): number {
  if (min > max) {
    return min; // Return min value for invalid range
  }

  if (min === max) {
    return min;
  }

  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValidValue = Math.floor(256 ** bytesNeeded / range) * range - 1;

  let randomValue: number;
  do {
    const bytes = generateSecureBytes(bytesNeeded);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) + bytes[i];
    }
  } while (randomValue > maxValidValue);

  return min + (randomValue % range);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(
  length: number = 16,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilar?: boolean;
  } = {},
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true,
  } = options;

  let charset = "";

  if (includeUppercase) {
    charset += excludeSimilar
      ? "ABCDEFGHJKLMNPQRSTUVWXYZ"
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (includeLowercase) {
    charset += excludeSimilar
      ? "abcdefghijkmnpqrstuvwxyz"
      : "abcdefghijklmnopqrstuvwxyz";
  }

  if (includeNumbers) {
    charset += excludeSimilar ? "23456789" : "0123456789";
  }

  if (includeSymbols) {
    charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  }

  if (charset.length === 0) {
    throw new Error(
      i18n.t("core.security.at-least-one-character-type-must-be-included"),
    );
  }

  return generateSecureString(length, charset);
}
