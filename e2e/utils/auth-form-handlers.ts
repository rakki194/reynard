/**
 * Authentication Form Handlers for E2E Testing
 *
 * Handles form interactions, validation, and user profile management
 * for authentication workflows.
 */

import { Page, expect } from "@playwright/test";
import { ITestUserData } from "../fixtures/user-data";

/**
 * Authentication Form Handlers Class
 */
export class AuthFormHandlers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Change user password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.page.click("[data-testid='change-password-button']");
    await this.page.fill(
      "[data-testid='current-password-input']",
      currentPassword,
    );
    await this.page.fill("[data-testid='new-password-input']", newPassword);
    await this.page.fill(
      "[data-testid='confirm-new-password-input']",
      newPassword,
    );
    await this.page.click("[data-testid='submit-password-change']");

    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<ITestUserData>): Promise<void> {
    await this.page.click("[data-testid='edit-profile-button']");

    if (profileData.fullName) {
      await this.page.fill(
        "[data-testid='full-name-input']",
        profileData.fullName,
      );
    }

    if (profileData.email) {
      await this.page.fill("[data-testid='email-input']", profileData.email);
    }

    await this.page.click("[data-testid='save-profile-button']");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Verify password strength indicator
   */
  async verifyPasswordStrength(
    password: string,
    expectedStrength: "weak" | "medium" | "strong",
  ): Promise<void> {
    await this.page.fill("[data-testid='password-input']", password);

    const strengthIndicator = this.page.locator(
      "[data-testid='password-strength']",
    );
    await expect(strengthIndicator).toHaveClass(new RegExp(expectedStrength));
  }

  /**
   * Verify form validation errors
   */
  async verifyFormValidation(
    field: string,
    expectedError: string,
  ): Promise<void> {
    const errorElement = this.page.locator(`[data-testid='${field}-error']`);
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedError);
  }

  /**
   * Verify form is disabled
   */
  async verifyFormDisabled(): Promise<void> {
    await expect(
      this.page.locator("[data-testid='submit-button']"),
    ).toBeDisabled();
  }

  /**
   * Verify form is enabled
   */
  async verifyFormEnabled(): Promise<void> {
    await expect(
      this.page.locator("[data-testid='submit-button']"),
    ).toBeEnabled();
  }

  /**
   * Wait for form submission to complete
   */
  async waitForFormSubmission(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }
}
