/**
 * Password Strength Composable
 * Advanced password strength analysis using zxcvbn
 */

import { createMemo } from "solid-js";
import type { PasswordStrength } from "reynard-auth-core";

export interface UsePasswordStrengthOptions {
  /** Use advanced zxcvbn analysis */
  useAdvanced?: boolean;
  /** Custom dictionary words to check against */
  customDictionary?: string[];
  /** User-specific inputs to check against (username, email, etc.) */
  userInputs?: string[];
  /** Minimum acceptable score */
  minScore?: number;
}

export function usePasswordStrength(password: () => string, options: UsePasswordStrengthOptions = {}) {
  const { useAdvanced = true, customDictionary = [], userInputs = [], minScore = 2 } = options;

  // Password strength analysis
  const strength = createMemo((): PasswordStrength => {
    const pwd = password();

    if (!pwd) {
      return {
        score: 0,
        isValid: false,
        feedback: "Password is required",
        suggestions: ["Enter a password"],
        crackTime: "instantly",
      };
    }

    if (useAdvanced) {
      return analyzeWithZxcvbn(pwd, userInputs, customDictionary);
    } else {
      return calculatePasswordStrength(pwd);
    }
  });

  // Strength label
  const strengthLabel = createMemo(() => {
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return labels[strength().score] || "Unknown";
  });

  // Strength color
  const strengthColor = createMemo(() => {
    const colors = [
      "#dc2626", // red-600
      "#ea580c", // orange-600
      "#d97706", // amber-600
      "#65a30d", // lime-600
      "#16a34a", // green-600
    ];
    return colors[strength().score] || "#6b7280";
  });

  // Progress percentage
  const strengthProgress = createMemo(() => {
    return Math.max(10, (strength().score / 4) * 100);
  });

  // Is password acceptable
  const isAcceptable = createMemo(() => {
    return strength().score >= minScore;
  });

  // Main feedback message
  const feedback = createMemo(() => {
    const s = strength();

    if (s.score === 0) {
      return "Choose a password";
    }

    if (s.score === 1) {
      return "This password is too weak";
    }

    if (s.score === 2) {
      return "This password is fair";
    }

    if (s.score === 3) {
      return "This password is good";
    }

    return "This password is strong";
  });

  // Requirements checklist
  const requirements = createMemo(() => {
    const pwd = password();

    return [
      {
        label: "At least 8 characters",
        met: pwd.length >= 8,
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(pwd),
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(pwd),
      },
      {
        label: "Contains number",
        met: /\d/.test(pwd),
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      },
    ];
  });

  // Requirements summary
  const requirementsSummary = createMemo(() => {
    const reqs = requirements();
    const met = reqs.filter(r => r.met).length;
    const total = reqs.length;

    return {
      met,
      total,
      percentage: (met / total) * 100,
      allMet: met === total,
    };
  });

  return {
    // Core analysis
    strength,
    strengthLabel,
    strengthColor,
    strengthProgress,

    // Validation
    isAcceptable,
    feedback,

    // Requirements
    requirements,
    requirementsSummary,

    // Utilities
    refresh: () => strength(), // Force recomputation
  };
}

/**
 * Basic password strength calculation
 */
function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push("Use at least 8 characters");
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push("Add lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push("Add uppercase letters");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push("Add numbers");
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    suggestions.push("Add special characters");
  }

  // Common patterns
  if (password.length < 6) {
    score = Math.max(0, score - 1);
    suggestions.push("Password is too short");
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push("Avoid repeated characters");
  }

  const feedback = getFeedbackMessage(score);
  const isValid = score >= 2;

  return {
    score,
    isValid,
    feedback,
    suggestions: suggestions.length > 0 ? suggestions : ["Password looks good!"],
    crackTime: getCrackTime(score),
  };
}

/**
 * Advanced password analysis using zxcvbn (if available)
 */
function analyzeWithZxcvbn(
  password: string,
  userInputs: string[] = [],
  customDictionary: string[] = []
): PasswordStrength {
  try {
    // Try to use zxcvbn if available
    if (typeof window !== "undefined" && (window as any).zxcvbn) {
      const result = (window as any).zxcvbn(password, [...userInputs, ...customDictionary]);

      const suggestions = [
        ...(result.feedback.suggestions || []),
        ...(result.feedback.warning ? [result.feedback.warning] : []),
      ];

      return {
        score: result.score,
        isValid: result.score >= 2,
        feedback: getFeedbackMessage(result.score, result.feedback.warning || undefined),
        suggestions: suggestions.filter(Boolean),
        crackTime: formatCrackTime(result.crackTimesDisplay.offlineSlowHashing1e4PerSecond),
      };
    }
  } catch (error) {
    console.warn("zxcvbn analysis failed, falling back to basic analysis:", error);
  }

  // Fallback to basic analysis
  return calculatePasswordStrength(password);
}

/**
 * Get human-readable feedback message
 */
function getFeedbackMessage(score: number, warning?: string): string {
  if (warning) {
    return warning;
  }

  const messages = [
    "This password is extremely weak",
    "This password is very weak",
    "This password is weak",
    "This password is good",
    "This password is strong",
  ];

  return messages[score] || "Password strength unknown";
}

/**
 * Get estimated crack time
 */
function getCrackTime(score: number): string {
  const times = [
    "instantly",
    "seconds",
    "minutes",
    "hours",
    "years",
  ];

  return times[score] || "unknown";
}

/**
 * Format crack time for display
 */
function formatCrackTime(crackTime: string): string {
  // Clean up the crack time string
  return crackTime
    .replace(/less than a second/, "instantly")
    .replace(/(\d+)\s*years?/, "$1 years")
    .replace(/(\d+)\s*months?/, "$1 months")
    .replace(/(\d+)\s*days?/, "$1 days")
    .replace(/(\d+)\s*hours?/, "$1 hours")
    .replace(/(\d+)\s*minutes?/, "$1 minutes")
    .replace(/(\d+)\s*seconds?/, "$1 seconds");
}
