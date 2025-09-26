/**
 * Login Form Component
 * Complete login form with validation and error handling
 */

import { Component, createSignal, createMemo, Show, splitProps } from "solid-js";
import { Button, Toggle } from "reynard-primitives";
import type { LoginCredentials } from "reynard-auth-core";
import { validateEmail } from "reynard-validation";

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

const defaultProps = {
  loading: false,
  showRememberMe: true,
  showForgotPassword: true,
  showRegisterLink: true,
};

export const LoginForm: Component<LoginFormProps> = props => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "loading",
    "error",
    "successMessage",
    "showRememberMe",
    "showForgotPassword",
    "showRegisterLink",
    "initialIdentifier",
    "onLogin",
    "onForgotPassword",
    "onRegisterClick",
    "class",
  ]);

  // Form state
  const [identifier, setIdentifier] = createSignal(local.initialIdentifier || "");
  const [password, setPassword] = createSignal("");
  const [rememberMe, setRememberMe] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);

  // Form validation
  const identifierError = createMemo(() => {
    const value = identifier().trim();
    if (!value) return "Username or email is required";

    // Check if it looks like an email
    if (value.includes("@")) {
      const emailResult = validateEmail(value);
      if (!emailResult.isValid) {
        return emailResult.error || "Please enter a valid email address";
      }
    }

    return null;
  });

  const passwordError = createMemo(() => {
    const value = password();
    if (!value) return "Password is required";
    if (value.length < 3) return "Password is too short";
    return null;
  });

  const isFormValid = createMemo(() => {
    return !identifierError() && !passwordError() && !local.loading;
  });

  // Handle form submission
  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!isFormValid() || !local.onLogin) return;

    const credentials: LoginCredentials = {
      identifier: identifier().trim(),
      password: password(),
      rememberMe: rememberMe(),
    };

    try {
      await local.onLogin(credentials);
    } catch (error) {
      // Error handling is typically done by the parent component
      console.error("Login error:", error);
    }
  };

  // Handle enter key
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && isFormValid()) {
      handleSubmit(event);
    }
  };

  return (
    <div class={`login-form ${local.class || ""}`} {...others}>
      <form onSubmit={handleSubmit} noValidate>
        <div class="login-form__content">
          {/* Header */}
          <div class="login-form__header">
            <h1 class="login-form__title">Sign In</h1>
            <p class="login-form__subtitle">Welcome back! Please sign in to your account.</p>
          </div>

          {/* Success Message */}
          <Show when={local.successMessage}>
            <div class="login-form__message login-form__message--success">{local.successMessage}</div>
          </Show>

          {/* Error Message */}
          <Show when={local.error}>
            <div class="login-form__message login-form__message--error">{local.error}</div>
          </Show>

          {/* Username/Email Field */}
          <div class="login-form__field">
            <label for="identifier" class="login-form__label">
              Username or Email
            </label>
            <div class="login-form__input-wrapper">
              <input
                id="identifier"
                type="text"
                class={`login-form__input ${identifierError() ? "login-form__input--error" : ""}`}
                value={identifier()}
                onInput={e => setIdentifier(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your username or email"
                disabled={local.loading}
                autocomplete="username"
                required
              />
              <span class="login-form__input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
            </div>
            <Show when={identifierError()}>
              <div class="login-form__error">{identifierError()}</div>
            </Show>
          </div>

          {/* Password Field */}
          <div class="login-form__field">
            <label for="password" class="login-form__label">
              Password
            </label>
            <div class="login-form__input-wrapper">
              <input
                id="password"
                type={showPassword() ? "text" : "password"}
                class={`login-form__input ${passwordError() ? "login-form__input--error" : ""}`}
                value={password()}
                onInput={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                disabled={local.loading}
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="login-form__password-toggle"
                onClick={() => setShowPassword(!showPassword())}
                disabled={local.loading}
                aria-label={showPassword() ? "Hide password" : "Show password"}
              >
                <Show when={showPassword()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                </Show>
                <Show when={!showPassword()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                </Show>
              </button>
            </div>
            <Show when={passwordError()}>
              <div class="login-form__error">{passwordError()}</div>
            </Show>
          </div>

          {/* Options Row */}
          <div class="login-form__options">
            <Show when={local.showRememberMe}>
              <label class="login-form__checkbox">
                <Toggle
                  size="sm"
                  checked={rememberMe()}
                  onChange={(checked: boolean) => setRememberMe(checked)}
                  disabled={local.loading}
                />
                <span class="login-form__checkbox-mark"></span>
                <span class="login-form__checkbox-label">Remember me</span>
              </label>
            </Show>

            <Show when={local.showForgotPassword}>
              <button type="button" class="login-form__link" onClick={local.onForgotPassword} disabled={local.loading}>
                Forgot password?
              </button>
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
            class="login-form__submit"
          >
            {local.loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Register Link */}
          <Show when={local.showRegisterLink}>
            <div class="login-form__footer">
              <span class="login-form__footer-text">
                Don't have an account?{" "}
                <button
                  type="button"
                  class="login-form__link login-form__link--primary"
                  onClick={local.onRegisterClick}
                  disabled={local.loading}
                >
                  Sign up
                </button>
              </span>
            </div>
          </Show>
        </div>
      </form>
    </div>
  );
};
