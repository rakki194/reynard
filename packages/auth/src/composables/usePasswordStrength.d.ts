/**
 * Password Strength Composable
 * Advanced password strength analysis using zxcvbn
 */
import type { PasswordStrength } from "../types";
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
export declare function usePasswordStrength(
  password: () => string,
  options?: UsePasswordStrengthOptions,
): {
  strength: import("solid-js").Accessor<PasswordStrength>;
  strengthLabel: import("solid-js").Accessor<string>;
  strengthColor: import("solid-js").Accessor<string>;
  strengthProgress: import("solid-js").Accessor<number>;
  isAcceptable: import("solid-js").Accessor<boolean>;
  feedback: import("solid-js").Accessor<
    | "Choose a password"
    | "This password is too weak"
    | "This password is fair"
    | "This password is good"
    | "This password is strong"
  >;
  requirements: import("solid-js").Accessor<
    {
      label: string;
      met: boolean;
    }[]
  >;
  requirementsSummary: import("solid-js").Accessor<{
    met: number;
    total: number;
    percentage: number;
    allMet: boolean;
  }>;
  refresh: () => PasswordStrength;
};
