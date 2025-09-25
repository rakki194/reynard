/**
 * Authentication Form Handlers for E2E Testing
 *
 * Provides comprehensive form interaction utilities for authentication
 * testing including registration, login, password change, and profile updates.
 */

import { Page, expect } from "@playwright/test";
import { ITestUserData } from "../fixtures/user-data";

export interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Authentication Form Handlers Class
 */
export class AuthFormHandlers {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to registration form
   */
  async navigateToRegistration(): Promise<void> {
    // Try multiple ways to get to registration
    const registerButton = this.page
      .locator("[data-testid='register-button'], [data-testid='show-register'], button:has-text('Register')")
      .first();

    if (await registerButton.isVisible()) {
      await registerButton.click();
    } else {
      // Navigate to registration page directly
      await this.page.goto("/register");
    }

    await this.page.waitForLoadState("networkidle");
    await expect(this.page.locator("[data-testid='registration-form'], [data-testid='register-form']")).toBeVisible();
  }

  /**
   * Navigate to login form
   */
  async navigateToLogin(): Promise<void> {
    const loginButton = this.page
      .locator("[data-testid='login-button'], [data-testid='show-login'], button:has-text('Login')")
      .first();

    if (await loginButton.isVisible()) {
      await loginButton.click();
    } else {
      await this.page.goto("/login");
    }

    await this.page.waitForLoadState("networkidle");
    await expect(this.page.locator("[data-testid='login-form']")).toBeVisible();
  }

  /**
   * Fill registration form with user data
   */
  async fillRegistrationForm(userData: Partial<ITestUserData>): Promise<void> {
    if (userData.username) {
      await this.page.fill("[data-testid='username-input'], [name='username'], #username", userData.username);
    }

    if (userData.email) {
      await this.page.fill("[data-testid='email-input'], [name='email'], #email", userData.email);
    }

    if (userData.password) {
      await this.page.fill("[data-testid='password-input'], [name='password'], #password", userData.password);

      // Fill confirm password if field exists
      const confirmPasswordField = this.page.locator(
        "[data-testid='confirm-password-input'], [name='confirmPassword'], #confirmPassword"
      );
      if (await confirmPasswordField.isVisible()) {
        await confirmPasswordField.fill(userData.password);
      }
    }

    if (userData.fullName) {
      const fullNameField = this.page.locator("[data-testid='full-name-input'], [name='fullName'], #fullName");
      if (await fullNameField.isVisible()) {
        await fullNameField.fill(userData.fullName);
      }
    }
  }

  /**
   * Submit registration form
   */
  async submitRegistrationForm(): Promise<void> {
    await this.page.click(
      "[data-testid='register-submit'], [data-testid='submit-registration'], button[type='submit']:has-text('Register')"
    );
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fill login form with credentials
   */
  async fillLoginForm(loginData: LoginFormData | Partial<ITestUserData>): Promise<void> {
    let identifier: string;
    let password: string;

    if ("identifier" in loginData) {
      identifier = loginData.identifier;
      password = loginData.password;
    } else {
      identifier = loginData.username || loginData.email || "";
      password = loginData.password || "";
    }

    // Try different selector patterns for username/identifier field
    const identifierField = this.page
      .locator(
        "[data-testid='username-input'], [data-testid='identifier-input'], [name='username'], [name='identifier'], #username, #identifier"
      )
      .first();

    if (await identifierField.isVisible()) {
      await identifierField.fill(identifier);
    }

    // Try different selector patterns for password field
    const passwordField = this.page.locator("[data-testid='password-input'], [name='password'], #password").first();

    if (await passwordField.isVisible()) {
      await passwordField.fill(password);
    }
  }

  /**
   * Submit login form
   */
  async submitLoginForm(): Promise<void> {
    await this.page.click(
      "[data-testid='login-submit'], [data-testid='submit-login'], button[type='submit']:has-text('Login'), button[type='submit']:has-text('Sign In')"
    );
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Enable remember me option
   */
  async enableRememberMe(): Promise<void> {
    const rememberMeCheckbox = this.page.locator("[data-testid='remember-me'], [name='rememberMe'], #rememberMe");
    if (await rememberMeCheckbox.isVisible()) {
      await rememberMeCheckbox.check();
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Navigate to password change form
    await this.page.click("[data-testid='change-password-link'], [data-testid='settings-link']");
    await this.page.waitForSelector("[data-testid='change-password-form'], [data-testid='password-form']");

    // Fill password change form
    await this.page.fill("[data-testid='current-password-input'], [name='currentPassword']", currentPassword);
    await this.page.fill("[data-testid='new-password-input'], [name='newPassword']", newPassword);

    // Fill confirm new password if field exists
    const confirmField = this.page.locator("[data-testid='confirm-new-password-input'], [name='confirmNewPassword']");
    if (await confirmField.isVisible()) {
      await confirmField.fill(newPassword);
    }

    // Submit password change
    await this.page.click("[data-testid='submit-password-change'], button[type='submit']:has-text('Change Password')");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<ITestUserData>): Promise<void> {
    // Navigate to profile edit form
    await this.page.click("[data-testid='profile-link'], [data-testid='edit-profile']");
    await this.page.waitForSelector("[data-testid='profile-form'], [data-testid='edit-profile-form']");

    // Update fields
    if (updates.fullName) {
      await this.page.fill("[data-testid='full-name-input'], [name='fullName']", updates.fullName);
    }

    if (updates.email) {
      await this.page.fill("[data-testid='email-input'], [name='email']", updates.email);
    }

    // Submit profile update
    await this.page.click("[data-testid='save-profile'], button[type='submit']:has-text('Save')");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Navigate to forgot password form
    await this.page.click("[data-testid='forgot-password-link'], a:has-text('Forgot Password')");
    await this.page.waitForSelector("[data-testid='forgot-password-form']");

    // Fill email and submit
    await this.page.fill("[data-testid='email-input'], [name='email']", email);
    await this.page.click("[data-testid='submit-forgot-password'], button[type='submit']:has-text('Reset Password')");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Clear form fields
   */
  async clearForm(): Promise<void> {
    const inputs = this.page.locator("input[type='text'], input[type='email'], input[type='password']");
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      await inputs.nth(i).clear();
    }
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const errorElements = this.page.locator(".error, .invalid, [aria-invalid='true'], [data-testid$='-error']");
    return (await errorElements.count()) > 0;
  }

  /**
   * Get form validation messages
   */
  async getValidationMessages(): Promise<string[]> {
    const errorElements = this.page.locator(".error, .invalid, [data-testid$='-error']");
    const messages: string[] = [];
    const count = await errorElements.count();

    for (let i = 0; i < count; i++) {
      const text = await errorElements.nth(i).textContent();
      if (text) {
        messages.push(text.trim());
      }
    }

    return messages;
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    const submitButton = this.page.locator("button[type='submit']").first();
    return !(await submitButton.isDisabled());
  }

  /**
   * Wait for form to be ready
   */
  async waitForFormReady(): Promise<void> {
    // Wait for form elements to be visible and enabled
    await expect(this.page.locator("form, [data-testid$='-form']")).toBeVisible();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Take screenshot of current form state
   */
  async screenshotForm(name: string): Promise<void> {
    const form = this.page.locator("form, [data-testid$='-form']").first();
    await form.screenshot({ path: `test-results/screenshots/${name}.png` });
  }
}
