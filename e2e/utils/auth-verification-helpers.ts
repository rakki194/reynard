/**
 * Authentication Verification Helpers for E2E Testing
 *
 * Provides verification and validation utilities for authentication
 * state, messages, and UI elements.
 */

import { Page, expect } from "@playwright/test";

/**
 * Authentication Verification Helpers Class
 */
export class AuthVerificationHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
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

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }
}
