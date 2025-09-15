/**
 * Core Authentication Operations for E2E Testing
 *
 * Handles fundamental authentication operations like login, registration,
 * logout, and token management.
 */

import { Page, expect } from "@playwright/test";
import { ITestUserData } from "../fixtures/user-data";
import { AuthTokenManager } from "./auth-token-manager";

/**
 * Core Authentication Operations Class
 */
export class AuthCoreOperations {
  private readonly page: Page;
  public readonly tokens: AuthTokenManager;

  constructor(page: Page) {
    this.page = page;
    this.tokens = new AuthTokenManager(page);
  }

  /**
   * Complete user login flow
   */
  async loginUser(userData: ITestUserData): Promise<void> {
    await this.fillLoginForm(userData);
    await this.submitLoginForm();

    // Wait for successful login
    await expect(this.page.locator("[data-testid='user-dashboard']")).toBeVisible();
  }

  /**
   * Complete user registration flow
   */
  async registerUser(userData: ITestUserData): Promise<void> {
    await this.fillRegistrationForm(userData);
    await this.submitRegistrationForm();

    // Wait for successful registration
    await expect(this.page.locator("[data-testid='registration-success']")).toBeVisible();
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.page.click("[data-testid='logout-button']");
    await this.page.waitForLoadState("networkidle");

    // Wait for logout confirmation
    await expect(this.page.locator("[data-testid='login-form']")).toBeVisible();
  }

  /**
   * Fill login form with user credentials
   */
  async fillLoginForm(userData: ITestUserData): Promise<void> {
    await this.page.fill("[data-testid='username-input']", userData.username);
    await this.page.fill("[data-testid='password-input']", userData.password);
  }

  /**
   * Submit login form
   */
  async submitLoginForm(): Promise<void> {
    await this.page.click("[data-testid='login-button']");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fill registration form with user data
   */
  async fillRegistrationForm(userData: ITestUserData): Promise<void> {
    await this.page.fill("[data-testid='username-input']", userData.username);
    await this.page.fill("[data-testid='email-input']", userData.email);
    await this.page.fill("[data-testid='password-input']", userData.password);
    await this.page.fill("[data-testid='confirm-password-input']", userData.password);

    if (userData.fullName) {
      await this.page.fill("[data-testid='full-name-input']", userData.fullName);
    }
  }

  /**
   * Submit registration form
   */
  async submitRegistrationForm(): Promise<void> {
    await this.page.click("[data-testid='register-button']");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Reload the current page
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Clear authentication state (delegates to token manager)
   */
  async clearAuthState(): Promise<void> {
    return this.tokens.clearAuthState();
  }
}
