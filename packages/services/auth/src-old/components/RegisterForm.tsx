/**
 * Register Form Component
 * Complete registration form with validation and password strength checking
 */

import { Component, createSignal, createMemo, Show, splitProps } from "solid-js";
import { Button, Toggle } from "reynard-primitives";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import type { RegisterData } from "../types";
import { validateEmail, validateUsername } from "../utils";

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

const defaultProps = {
  loading: false,
  requireEmail: true,
  requireFullName: false,
  showTermsAcceptance: true,
  showPrivacyAcceptance: true,
  showLoginLink: true,
};

export const RegisterForm: Component<RegisterFormProps> = props => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "loading",
    "error",
    "successMessage",
    "requireEmail",
    "requireFullName",
    "showTermsAcceptance",
    "showPrivacyAcceptance",
    "showLoginLink",
    "onRegister",
    "onLoginClick",
    "onTermsClick",
    "onPrivacyClick",
    "class",
  ]);

  // Form state
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [fullName, setFullName] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [acceptTerms, setAcceptTerms] = createSignal(false);
  const [acceptPrivacy, setAcceptPrivacy] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

  // Form validation
  const usernameError = createMemo(() => {
    const value = username().trim();
    if (!value) return "Username is required";
    if (!validateUsername(value)) {
      return "Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores";
    }
    return null;
  });

  const emailError = createMemo(() => {
    const value = email().trim();
    if (local.requireEmail && !value) return "Email is required";
    if (value && !validateEmail(value)) return "Please enter a valid email address";
    return null;
  });

  const fullNameError = createMemo(() => {
    const value = fullName().trim();
    if (local.requireFullName && !value) return "Full name is required";
    if (value && value.length < 2) return "Full name must be at least 2 characters";
    return null;
  });

  const passwordError = createMemo(() => {
    const value = password();
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return null;
  });

  const confirmPasswordError = createMemo(() => {
    const value = confirmPassword();
    if (!value) return "Please confirm your password";
    if (value !== password()) return "Passwords do not match";
    return null;
  });

  const termsError = createMemo(() => {
    if (local.showTermsAcceptance && !acceptTerms()) {
      return "You must accept the terms of service";
    }
    return null;
  });

  const privacyError = createMemo(() => {
    if (local.showPrivacyAcceptance && !acceptPrivacy()) {
      return "You must accept the privacy policy";
    }
    return null;
  });

  const isFormValid = createMemo(() => {
    return (
      !usernameError() &&
      !emailError() &&
      !fullNameError() &&
      !passwordError() &&
      !confirmPasswordError() &&
      !termsError() &&
      !privacyError() &&
      !local.loading
    );
  });

  // Handle form submission
  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!isFormValid() || !local.onRegister) return;

    const data: RegisterData = {
      username: username().trim(),
      email: email().trim(),
      password: password(),
      confirmPassword: confirmPassword(),
      fullName: fullName().trim() || undefined,
      acceptTerms: acceptTerms(),
      acceptPrivacy: acceptPrivacy(),
    };

    try {
      await local.onRegister(data);
    } catch (error) {
      // Error handling is typically done by the parent component
      console.error("Registration error:", error);
    }
  };

  return (
    <div class={`register-form ${local.class || ""}`} {...others}>
      <form onSubmit={handleSubmit} noValidate>
        <div class="register-form__content">
          {/* Header */}
          <div class="register-form__header">
            <h1 class="register-form__title">Create Account</h1>
            <p class="register-form__subtitle">Join us today! Please fill in the details below.</p>
          </div>

          {/* Success Message */}
          <Show when={local.successMessage}>
            <div class="register-form__message register-form__message--success">{local.successMessage}</div>
          </Show>

          {/* Error Message */}
          <Show when={local.error}>
            <div class="register-form__message register-form__message--error">{local.error}</div>
          </Show>

          {/* Full Name Field */}
          <Show when={local.requireFullName || fullName()}>
            <div class="register-form__field">
              <label for="fullName" class="register-form__label">
                Full Name {local.requireFullName && <span class="register-form__required">*</span>}
              </label>
              <input
                id="fullName"
                type="text"
                class={`register-form__input ${fullNameError() ? "register-form__input--error" : ""}`}
                value={fullName()}
                onInput={e => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={local.loading}
                autocomplete="name"
              />
              <Show when={fullNameError()}>
                <div class="register-form__error">{fullNameError()}</div>
              </Show>
            </div>
          </Show>

          {/* Username Field */}
          <div class="register-form__field">
            <label for="username" class="register-form__label">
              Username <span class="register-form__required">*</span>
            </label>
            <input
              id="username"
              type="text"
              class={`register-form__input ${usernameError() ? "register-form__input--error" : ""}`}
              value={username()}
              onInput={e => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={local.loading}
              autocomplete="username"
              required
            />
            <Show when={usernameError()}>
              <div class="register-form__error">{usernameError()}</div>
            </Show>
          </div>

          {/* Email Field */}
          <Show when={local.requireEmail || email()}>
            <div class="register-form__field">
              <label for="email" class="register-form__label">
                Email Address {local.requireEmail && <span class="register-form__required">*</span>}
              </label>
              <input
                id="email"
                type="email"
                class={`register-form__input ${emailError() ? "register-form__input--error" : ""}`}
                value={email()}
                onInput={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={local.loading}
                autocomplete="email"
              />
              <Show when={emailError()}>
                <div class="register-form__error">{emailError()}</div>
              </Show>
            </div>
          </Show>

          {/* Password Field */}
          <div class="register-form__field">
            <label for="password" class="register-form__label">
              Password <span class="register-form__required">*</span>
            </label>
            <div class="register-form__input-wrapper">
              <input
                id="password"
                type={showPassword() ? "text" : "password"}
                class={`register-form__input ${passwordError() ? "register-form__input--error" : ""}`}
                value={password()}
                onInput={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                disabled={local.loading}
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="register-form__password-toggle"
                onClick={() => setShowPassword(!showPassword())}
                disabled={local.loading}
                aria-label={showPassword() ? "Hide password" : "Show password"}
              >
                {showPassword() ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
            <Show when={passwordError()}>
              <div class="register-form__error">{passwordError()}</div>
            </Show>
          </div>

          {/* Password Strength Meter */}
          <Show when={password()}>
            <PasswordStrengthMeter
              password={password()}
              userInputs={[username(), email(), fullName()].filter(Boolean)}
              showRequirements={true}
              showSuggestions={true}
              showCrackTime={false}
            />
          </Show>

          {/* Confirm Password Field */}
          <div class="register-form__field">
            <label for="confirmPassword" class="register-form__label">
              Confirm Password <span class="register-form__required">*</span>
            </label>
            <div class="register-form__input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword() ? "text" : "password"}
                class={`register-form__input ${confirmPasswordError() ? "register-form__input--error" : ""}`}
                value={confirmPassword()}
                onInput={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={local.loading}
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="register-form__password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                disabled={local.loading}
                aria-label={showConfirmPassword() ? "Hide password" : "Show password"}
              >
                {showConfirmPassword() ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
            <Show when={confirmPasswordError()}>
              <div class="register-form__error">{confirmPasswordError()}</div>
            </Show>
          </div>

          {/* Terms and Privacy Checkboxes */}
          <div class="register-form__agreements">
            <Show when={local.showTermsAcceptance}>
              <label class="register-form__checkbox">
                <Toggle
                  size="sm"
                  checked={acceptTerms()}
                  onChange={checked => setAcceptTerms(checked)}
                  disabled={local.loading}
                />
                <span class="register-form__checkbox-mark"></span>
                <span class="register-form__checkbox-label">
                  I agree to the{" "}
                  <button type="button" class="register-form__link" onClick={local.onTermsClick}>
                    Terms of Service
                  </button>
                </span>
              </label>
              <Show when={termsError()}>
                <div class="register-form__error">{termsError()}</div>
              </Show>
            </Show>

            <Show when={local.showPrivacyAcceptance}>
              <label class="register-form__checkbox">
                <Toggle
                  size="sm"
                  checked={acceptPrivacy()}
                  onChange={checked => setAcceptPrivacy(checked)}
                  disabled={local.loading}
                />
                <span class="register-form__checkbox-mark"></span>
                <span class="register-form__checkbox-label">
                  I agree to the{" "}
                  <button type="button" class="register-form__link" onClick={local.onPrivacyClick}>
                    Privacy Policy
                  </button>
                </span>
              </label>
              <Show when={privacyError()}>
                <div class="register-form__error">{privacyError()}</div>
              </Show>
            </Show>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={local.loading}
            disabled={!isFormValid()}
            class="register-form__submit"
          >
            {local.loading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Login Link */}
          <Show when={local.showLoginLink}>
            <div class="register-form__footer">
              <span class="register-form__footer-text">
                Already have an account?{" "}
                <button
                  type="button"
                  class="register-form__link register-form__link--primary"
                  onClick={local.onLoginClick}
                  disabled={local.loading}
                >
                  Sign in
                </button>
              </span>
            </div>
          </Show>
        </div>
      </form>
    </div>
  );
};
