/**
 * Authentication Element Verification for E2E Testing
 *
 * Provides generic element verification utilities for authentication testing.
 */

import { Page, expect } from "@playwright/test";

/**
 * Authentication Element Verification Class
 */
export class AuthElementVerification {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Verify element is hidden
   */
  async verifyElementHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * Verify element contains text
   */
  async verifyElementText(selector: string, expectedText: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  /**
   * Verify element has class
   */
  async verifyElementClass(selector: string, className: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveClass(new RegExp(className));
  }

  /**
   * Verify element is enabled
   */
  async verifyElementEnabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeEnabled();
  }

  /**
   * Verify element is disabled
   */
  async verifyElementDisabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeDisabled();
  }

  /**
   * Verify element has attribute
   */
  async verifyElementAttribute(
    selector: string,
    attribute: string,
    expectedValue: string,
  ): Promise<void> {
    await expect(this.page.locator(selector)).toHaveAttribute(
      attribute,
      expectedValue,
    );
  }

  /**
   * Verify element count
   */
  async verifyElementCount(selector: string, expectedCount: number): Promise<void> {
    await expect(this.page.locator(selector)).toHaveCount(expectedCount);
  }

  /**
   * Verify element is focused
   */
  async verifyElementFocused(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeFocused();
  }

  /**
   * Verify element is checked
   */
  async verifyElementChecked(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeChecked();
  }

  /**
   * Verify element is unchecked
   */
  async verifyElementUnchecked(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).not.toBeChecked();
  }

  /**
   * Verify element has CSS property
   */
  async verifyElementCSSProperty(
    selector: string,
    property: string,
    expectedValue: string,
  ): Promise<void> {
    await expect(this.page.locator(selector)).toHaveCSS(property, expectedValue);
  }
}
