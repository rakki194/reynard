/**
 * Password Strength Meter Component
 * Visual password strength indicator with detailed feedback
 */
import { Component } from "solid-js";
import type { UsePasswordStrengthOptions } from "../composables/usePasswordStrength";
import "./PasswordStrengthMeter.css";
export interface PasswordStrengthMeterProps extends UsePasswordStrengthOptions {
  /** Password to analyze */
  password: string;
  /** Whether to show detailed requirements */
  showRequirements?: boolean;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Whether to show crack time estimate */
  showCrackTime?: boolean;
  /** Compact mode (less visual elements) */
  compact?: boolean;
  /** Custom class name */
  class?: string;
}
export declare const PasswordStrengthMeter: Component<PasswordStrengthMeterProps>;
