/**
 * Authentication Test Helpers for E2E Testing
 *
 * Provides comprehensive helper functions for testing authentication workflows
 * across the Reynard ecosystem.
 */

import { Page, expect } from "@playwright/test";
import { TestUserData } from "../fixtures/test-data";

/**
 * Authentication Test Helpers Class
 */
export class AuthTestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Fill registration form with user data
   */
  async fillRegistrationForm(userData: TestUserData): Promise<void> {
    await this.page.fill("[data-testid='username-input']", userData.username);
    await this.page.fill("[data-testid='email-input']", userData.email);
    await this.page.fill("[data-testid='password-input']", userData.password);
    await this.page.fill(
      "[data-testid='confirm-password-input']",
      userData.password,
    );

    if (userData.fullName) {
      await this.page.fill(
        "[data-testid='full-name-input']",
        userData.fullName,
      );
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
   * Fill login form with user credentials
   */
  async fillLoginForm(userData: TestUserData): Promise<void> {
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
   * Complete user login flow
   */
  async loginUser(userData: TestUserData): Promise<void> {
    await this.fillLoginForm(userData);
    await this.submitLoginForm();

    // Wait for successful login
    await expect(
      this.page.locator("[data-testid='user-dashboard']"),
    ).toBeVisible();
  }

  /**
   * Complete user registration flow
   */
  async registerUser(userData: TestUserData): Promise<void> {
    await this.fillRegistrationForm(userData);
    await this.submitRegistrationForm();

    // Wait for successful registration
    await expect(
      this.page.locator("[data-testid='registration-success']"),
    ).toBeVisible();
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
  async updateProfile(profileData: Partial<TestUserData>): Promise<void> {
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
   * Verify user is authenticated
   */
  async verifyAuthenticated(): Promise<void> {
    await expect(
      this.page.locator("[data-testid='user-dashboard']"),
    ).toBeVisible();
    await expect(this.page.locator("[data-testid='user-menu']")).toBeVisible();
  }

  /**
   * Verify user is not authenticated
   */
  async verifyNotAuthenticated(): Promise<void> {
    await expect(this.page.locator("[data-testid='login-form']")).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(
    errorType: string,
    expectedMessage?: string,
  ): Promise<void> {
    const errorElement = this.page.locator(`[data-testid='${errorType}']`);
    await expect(errorElement).toBeVisible();

    if (expectedMessage) {
      await expect(errorElement).toContainText(expectedMessage);
    }
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(
    successType: string,
    expectedMessage?: string,
  ): Promise<void> {
    const successElement = this.page.locator(`[data-testid='${successType}']`);
    await expect(successElement).toBeVisible();

    if (expectedMessage) {
      await expect(successElement).toContainText(expectedMessage);
    }
  }

  /**
   * Wait for authentication state change
   */
  async waitForAuthStateChange(
    expectedState: "authenticated" | "unauthenticated",
    timeout: number = 5000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (expectedState === "authenticated") {
          await this.verifyAuthenticated();
          return;
        } else {
          await this.verifyNotAuthenticated();
          return;
        }
      } catch (error) {
        // Continue waiting
        await this.page.waitForTimeout(100);
      }
    }

    throw new Error(`Timeout waiting for auth state: ${expectedState}`);
  }

  /**
   * Clear authentication state (localStorage, sessionStorage)
   */
  async clearAuthState(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Get authentication tokens from storage
   */
  async getAuthTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    return await this.page.evaluate(() => ({
      accessToken: localStorage.getItem("access_token"),
      refreshToken: localStorage.getItem("refresh_token"),
    }));
  }

  /**
   * Set authentication tokens in storage
   */
  async setAuthTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.page.evaluate(
      ({ accessToken, refreshToken }) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
      },
      { accessToken, refreshToken },
    );
  }

  /**
   * Simulate token expiration
   */
  async simulateTokenExpiration(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.setItem("access_token", "expired-token");
    });
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    return await this.page.evaluate(
      async ({ endpoint, options }) => {
        const token = localStorage.getItem("access_token");

        const response = await fetch(endpoint, {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        return {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers as any),
          body: await response.text(),
        };
      },
      { endpoint, options },
    );
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
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for specific element to be visible
   */
  async waitForElement(
    selector: string,
    timeout: number = 5000,
  ): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Wait for specific element to be hidden
   */
  async waitForElementHidden(
    selector: string,
    timeout: number = 5000,
  ): Promise<void> {
    await this.page.waitForSelector(selector, { state: "hidden", timeout });
  }
}

/**
 * Setup authentication test environment
 */
export async function setupAuthTestEnvironment(_config: any): Promise<any> {
  return {
    clearAuthState: async () => {
      // Clear authentication state
    },
    getAuthState: () => {
      // Get current authentication state
      return "unauthenticated";
    },
    cleanup: async () => {
      // Cleanup test environment
    },
  };
}

/**
 * Authentication flow test scenarios
 */
export class AuthFlowScenarios {
  private helpers: AuthTestHelpers;

  constructor(helpers: AuthTestHelpers) {
    this.helpers = helpers;
  }

  /**
   * Complete registration and login flow
   */
  async completeRegistrationAndLogin(userData: TestUserData): Promise<void> {
    await this.helpers.registerUser(userData);
    await this.helpers.logout();
    await this.helpers.loginUser(userData);
  }

  /**
   * Test password change flow
   */
  async testPasswordChange(
    userData: TestUserData,
    newPassword: string,
  ): Promise<void> {
    await this.helpers.loginUser(userData);
    await this.helpers.changePassword(userData.password, newPassword);
    await this.helpers.verifySuccessMessage("password-change-success");
  }

  /**
   * Test profile update flow
   */
  async testProfileUpdate(
    userData: TestUserData,
    updates: Partial<TestUserData>,
  ): Promise<void> {
    await this.helpers.loginUser(userData);
    await this.helpers.updateProfile(updates);
    await this.helpers.verifySuccessMessage("profile-update-success");
  }

  /**
   * Test session persistence
   */
  async testSessionPersistence(userData: TestUserData): Promise<void> {
    await this.helpers.loginUser(userData);

    // Refresh page - access page through the helpers instance
    await this.helpers.page.reload();

    // Verify user is still logged in
    await this.helpers.verifyAuthenticated();
  }

  /**
   * Test concurrent login attempts
   */
  async testConcurrentLogins(userData: TestUserData): Promise<void> {
    const promises = Array.from({ length: 3 }, () =>
      this.helpers.loginUser(userData),
    );

    await Promise.all(promises);
    await this.helpers.verifyAuthenticated();
  }
}
