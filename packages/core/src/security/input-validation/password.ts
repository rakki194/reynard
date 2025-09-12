/**
 * Password Input Validation Utilities
 * Functions for validating password strength
 */

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  if (!password || typeof password !== "string") {
    return { isValid: false, score: 0, feedback: ["Password is required"] };
  }

  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long");
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push("Password must contain at least one number");
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push("Password must contain at least one special character");
  } else {
    score += 1;
  }

  // Common password check
  const commonPasswords = [
    "password", "123456", "123456789", "qwerty", "abc123",
    "password123", "admin", "letmein", "welcome", "monkey"
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push("Password is too common");
    score -= 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}
