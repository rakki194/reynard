/**
 * Validation utilities for the Reynard Auth system.
 *
 * This module contains validation functions for user inputs,
 * email addresses, usernames, and other authentication data.
 * Uses the consolidated validation system from reynard-validation.
 *
 * @deprecated Use reynard-validation package directly
 */

import {
  validateEmail as validateEmailCore,
  validatePassword as validatePasswordCore,
  validateUsername as validateUsernameCore,
  type ValidationResult,
} from "reynard-validation";
import type { PasswordStrength, ValidationRules } from "../types";
import { DEFAULT_VALIDATION_RULES } from "../types";

/**
 * Validate email address format using consolidated validation
 */
export function validateEmail(email: string): boolean {
  const result = validateEmailCore(email);
  return result.isValid;
}

/**
 * Validate username format using consolidated validation
 */
export function validateUsername(username: string): boolean {
  const result = validateUsernameCore(username);
  return result.isValid;
}

/**
 * Validate password strength with enhanced feedback
 */
export function validatePassword(
  password: string,
  rules: ValidationRules = DEFAULT_VALIDATION_RULES
): PasswordStrength {
  // Use consolidated validation for basic password validation
  const basicResult = validatePasswordCore(password);

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
  } else if (rules.requireUppercase && /[A-Z]/.test(password)) {
    score += 1;
  }

  // Lowercase check
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else if (rules.requireLowercase && /[a-z]/.test(password)) {
    score += 1;
  }

  // Number check
  if (rules.requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else if (rules.requireNumber && /\d/.test(password)) {
    score += 1;
  }

  // Special character check
  if (rules.requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  } else if (rules.requireSpecialChar && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
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
 * Validate email with detailed result
 */
export function validateEmailDetailed(email: string): ValidationResult {
  return validateEmailCore(email);
}

/**
 * Validate username with detailed result
 */
export function validateUsernameDetailed(username: string): ValidationResult {
  return validateUsernameCore(username);
}

/**
 * Validate password with detailed result
 */
export function validatePasswordDetailed(password: string): ValidationResult {
  return validatePasswordCore(password);
}
