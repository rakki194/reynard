/**
 * Authentication Form Utilities for E2E Testing
 *
 * Provides generic form handling utilities for authentication testing.
 */

import { Page, expect } from "@playwright/test";

/**
 * Authentication Form Utilities Class
 */
export class AuthFormUtilities {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Fill and submit a generic form
   */
  async fillAndSubmitForm(formData: Record<string, string>, submitButtonSelector: string): Promise<void> {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[data-testid='${field}']`, value);
    }
    await this.page.click(`[data-testid='${submitButtonSelector}']`);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Clear form fields
   */
  async clearForm(fields: string[]): Promise<void> {
    for (const field of fields) {
      await this.page.fill(`[data-testid='${field}']`, "");
    }
  }

  /**
   * Verify form field values
   */
  async verifyFormFieldValues(expectedValues: Record<string, string>): Promise<void> {
    for (const [field, expectedValue] of Object.entries(expectedValues)) {
      const fieldElement = this.page.locator(`[data-testid='${field}']`);
      await expect(fieldElement).toHaveValue(expectedValue);
    }
  }

  /**
   * Fill form field by selector
   */
  async fillField(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Click element by selector
   */
  async clickElement(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(selector: string): Promise<void> {
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   */
  async uncheckCheckbox(selector: string): Promise<void> {
    await this.page.uncheck(selector);
  }

  /**
   * Get form field value
   */
  async getFieldValue(selector: string): Promise<string> {
    return await this.page.inputValue(selector);
  }

  /**
   * Verify form field is empty
   */
  async verifyFieldEmpty(selector: string): Promise<void> {
    const value = await this.getFieldValue(selector);
    expect(value).toBe("");
  }

  /**
   * Verify form field has value
   */
  async verifyFieldHasValue(selector: string, expectedValue: string): Promise<void> {
    const value = await this.getFieldValue(selector);
    expect(value).toBe(expectedValue);
  }
}
