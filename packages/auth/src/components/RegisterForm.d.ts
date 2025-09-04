/**
 * Register Form Component
 * Complete registration form with validation and password strength checking
 */
import { Component } from "solid-js";
import type { RegisterData } from "../types";
export interface RegisterFormProps {
  /** Whether registration is in progress */
  loading?: boolean;
  /** Registration error message */
  error?: string;
  /** Success message */
  successMessage?: string;
  /** Whether to require email */
  requireEmail?: boolean;
  /** Whether to require full name */
  requireFullName?: boolean;
  /** Whether to show terms acceptance */
  showTermsAcceptance?: boolean;
  /** Whether to show privacy policy acceptance */
  showPrivacyAcceptance?: boolean;
  /** Whether to show login link */
  showLoginLink?: boolean;
  /** Registration handler */
  onRegister?: (data: RegisterData) => void | Promise<void>;
  /** Login link handler */
  onLoginClick?: () => void;
  /** Terms link handler */
  onTermsClick?: () => void;
  /** Privacy policy link handler */
  onPrivacyClick?: () => void;
  /** Custom class name */
  class?: string;
}
export declare const RegisterForm: Component<RegisterFormProps>;
