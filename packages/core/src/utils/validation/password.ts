/**
 * Password Validation Utilities
 * Functions for password strength validation
 */

import { t } from "../optional-i18n";

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
    feedback.push(t("core.password.must-be-at-least-8-characters-long"));
  } else if (password.length >= 8) {
    score += 25;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push(
      t("core.password.must-contain-at-least-one-uppercase-letter"),
    );
  } else {
    score += 25;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push(
      t("core.password.must-contain-at-least-one-lowercase-letter"),
    );
  } else {
    score += 25;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push(t("core.password.must-contain-at-least-one-number"));
  } else {
    score += 15;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    feedback.push(
      t("core.password.must-contain-at-least-one-special-character"),
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
