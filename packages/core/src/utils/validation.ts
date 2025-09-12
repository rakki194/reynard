/**
 * Validation Utilities
 * Comprehensive validation functions for forms and data
 */

import { i18n } from "reynard-i18n";

/**
 * Email validation using RFC 5322 compliant regex
 */
export function isValidEmail(email: string): boolean {
  // Handle null/undefined/empty input
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  // Handle null/undefined/empty input
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Phone number validation (supports various formats)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Handle null/undefined/empty input
  if (!phone || typeof phone !== "string") {
    return false;
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // Check if it's a valid length (7-15 digits for international numbers)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push(i18n.t("core.password.must-be-at-least-8-characters-long"));
  } else if (password.length >= 8) {
    score += 25;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push(
      i18n.t("core.password.must-contain-at-least-one-uppercase-letter"),
    );
  } else {
    score += 25;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push(
      i18n.t("core.password.must-contain-at-least-one-lowercase-letter"),
    );
  } else {
    score += 25;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push(i18n.t("core.password.must-contain-at-least-one-number"));
  } else {
    score += 15;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    feedback.push(
      i18n.t("core.password.must-contain-at-least-one-special-character"),
    );
  } else {
    score += 10;
  }

  // If there are any feedback items, the password is invalid and score should be 0
  if (feedback.length > 0) {
    score = 0;
  }

  return {
    isValid: feedback.length === 0,
    score,
    feedback,
  };
}

/**
 * Credit card number validation using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, "");

  // Check if it's a valid length
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * ZIP/Postal code validation (US and international)
 */
export function isValidPostalCode(
  postalCode: string,
  country: string = "US",
): boolean {
  // Handle null/undefined/empty input
  if (
    !postalCode ||
    typeof postalCode !== "string" ||
    !country ||
    typeof country !== "string"
  ) {
    return false;
  }

  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, // A1A 1A1
    UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/, // SW1A 1AA
    DE: /^\d{5}$/, // 12345
    FR: /^\d{5}$/, // 12345
    JP: /^\d{3}-\d{4}$/, // 123-4567
    AU: /^\d{4}$/, // 1234
  };

  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(postalCode) : false; // Return false for unknown countries
}

/**
 * Social Security Number validation (US format)
 */
export function isValidSSN(ssn: string): boolean {
  // Handle null/undefined/empty input
  if (!ssn || typeof ssn !== "string") {
    return false;
  }

  // Remove all non-digit characters
  const digits = ssn.replace(/\D/g, "");

  // Must be exactly 9 digits
  if (digits.length !== 9) {
    return false;
  }

  // Invalid patterns
  const invalidPatterns = [
    "000000000",
    "111111111",
    "222222222",
    "333333333",
    "444444444",
    "555555555",
    "666666666",
    "777777777",
    "888888888",
    "999999999",
  ];

  if (invalidPatterns.includes(digits)) {
    return false;
  }

  // Area number cannot be 000, 666, or 900-999
  const area = parseInt(digits.substring(0, 3));
  if (area === 0 || area === 666 || area >= 900) {
    return false;
  }

  // Group number cannot be 00
  const group = parseInt(digits.substring(3, 5));
  if (group === 0) {
    return false;
  }

  // Serial number cannot be 0000
  const serial = parseInt(digits.substring(5, 9));
  if (serial === 0) {
    return false;
  }

  return true;
}

/**
 * Username validation
 */
export function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscores only, cannot start with number
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}

/**
 * Hexadecimal color validation
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * IP address validation (IPv4 and IPv6)
 */
export function isValidIPAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 pattern (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Numeric range validation
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * String length validation
 */
export function isValidLength(
  str: string,
  minLength: number = 0,
  maxLength: number = Number.MAX_SAFE_INTEGER,
): boolean {
  return str.length >= minLength && str.length <= maxLength;
}

/**
 * Required field validation
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * File type validation
 */
export function isValidFileType(
  filename: string,
  allowedTypes: string[],
): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * File size validation (in bytes)
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * Date validation (checks if date is valid and optionally in range)
 */
export function isValidDate(
  date: string | Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  // Check min date
  if (minDate && dateObj < minDate) {
    return false;
  }

  // Check max date
  if (maxDate && dateObj > maxDate) {
    return false;
  }

  return true;
}

/**
 * Age validation (checks if person is at least a certain age)
 */
export function isValidAge(birthDate: string | Date, minAge: number): boolean {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
}
