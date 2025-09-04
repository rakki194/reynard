/**
 * Login Form Component
 * Complete login form with validation and error handling
 */
import { Component } from "solid-js";
import type { LoginCredentials } from "../types";
export interface LoginFormProps {
  /** Whether login is in progress */
  loading?: boolean;
  /** Login error message */
  error?: string;
  /** Success message */
  successMessage?: string;
  /** Whether to show remember me option */
  showRememberMe?: boolean;
  /** Whether to show forgot password link */
  showForgotPassword?: boolean;
  /** Whether to show register link */
  showRegisterLink?: boolean;
  /** Initial username/email value */
  initialIdentifier?: string;
  /** Login handler */
  onLogin?: (credentials: LoginCredentials) => void | Promise<void>;
  /** Forgot password handler */
  onForgotPassword?: () => void;
  /** Register link handler */
  onRegisterClick?: () => void;
  /** Custom class name */
  class?: string;
}
export declare const LoginForm: Component<LoginFormProps>;
