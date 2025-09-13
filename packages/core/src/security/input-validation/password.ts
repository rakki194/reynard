/**
 * Password Input Validation Utilities
 * Functions for validating password strength with comprehensive security checks
 */

import { t } from "../../utils/optional-i18n";

/**
 * Password strength validation result
 */
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
}

/**
 * Validate password strength with comprehensive security checks
 */
export function validatePassword(password: string): PasswordStrength {
  if (!password || typeof password !== "string") {
    return { 
      isValid: false, 
      score: 0, 
      feedback: [t("core.password.passwordIsRequired")] 
    };
  }

  const feedback: string[] = [];
  let score = 0;

  // Length check (25 points)
  if (password.length < 8) {
    feedback.push(t("core.password.mustBeAtLeast8CharactersLong"));
  } else if (password.length >= 8) {
    score += 25;
  }

  // Uppercase check (25 points)
  if (!/[A-Z]/.test(password)) {
    feedback.push(t("core.password.mustContainAtLeastOneUppercaseLetter"));
  } else {
    score += 25;
  }

  // Lowercase check (25 points)
  if (!/[a-z]/.test(password)) {
    feedback.push(t("core.password.mustContainAtLeastOneLowercaseLetter"));
  } else {
    score += 25;
  }

  // Number check (15 points)
  if (!/\d/.test(password)) {
    feedback.push(t("core.password.mustContainAtLeastOneNumber"));
  } else {
    score += 15;
  }

  // Special character check (10 points)
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    feedback.push(t("core.password.mustContainAtLeastOneSpecialCharacter"));
  } else {
    score += 10;
  }

  // Common password check
  const commonPasswords = [
    "password", "123456", "123456789", "qwerty", "abc123",
    "password123", "admin", "letmein", "welcome", "monkey",
    "12345678", "1234567890", "qwerty123", "password1", "123123"
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push(t("core.password.passwordIsTooCommon"));
    score = Math.max(0, score - 20); // Penalty for common passwords
  }

  // Sequential character check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push(t("core.password.noRepeatingCharacters"));
    score = Math.max(0, score - 10);
  }

  // Keyboard pattern check
  const keyboardPatterns = [
    "qwerty", "asdfgh", "zxcvbn", "123456", "abcdef"
  ];
  
  for (const pattern of keyboardPatterns) {
    if (password.toLowerCase().includes(pattern)) {
      feedback.push(t("core.password.noKeyboardPatterns"));
      score = Math.max(0, score - 15);
      break;
    }
  }

  // If there are any feedback items, the password is invalid
  if (feedback.length > 0) {
    score = 0;
  }

  return {
    isValid: feedback.length === 0,
    score,
    feedback,
  };
}
