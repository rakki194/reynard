/**
 * DOM Element Assertions for Playwright E2E Tests
 *
 * Provides specific assertions for individual DOM elements.
 *
 * @author 🦊 The Cunning Fox
 */

import { expect, Locator } from "@playwright/test";

/**
 * DOM Element Assertions Class
 * Provides specific assertions for individual DOM elements
 */
export class DOMElementAssertions {
  constructor(private readonly _locator: Locator) {}

  /**
   * Get the underlying Playwright locator
   */
  get locator(): Locator {
    return this._locator;
  }

  /**
   * Assert element is visible
   */
  async toBeVisible(): Promise<void> {
    await expect(this._locator).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  async toBeHidden(): Promise<void> {
    await expect(this._locator).toBeHidden();
  }

  /**
   * Assert element is attached to the DOM
   */
  async toBeInDocument(): Promise<void> {
    await expect(this._locator).toBeAttached();
  }

  /**
   * Assert element is not attached to the DOM
   */
  async notToBeInDocument(): Promise<void> {
    await expect(this._locator).not.toBeAttached();
  }

  /**
   * Assert element is enabled
   */
  async toBeEnabled(): Promise<void> {
    await expect(this._locator).toBeEnabled();
  }

  /**
   * Assert element is disabled
   */
  async toBeDisabled(): Promise<void> {
    await expect(this._locator).toBeDisabled();
  }

  /**
   * Assert element is required
   */
  async toBeRequired(): Promise<void> {
    await expect(this._locator).toHaveAttribute("required");
  }

  /**
   * Assert element is not required
   */
  async notToBeRequired(): Promise<void> {
    await expect(this._locator).not.toHaveAttribute("required");
  }

  /**
   * Assert element is valid
   */
  async toBeValid(): Promise<void> {
    await expect(this._locator).toHaveJSProperty("validity.valid", true);
  }

  /**
   * Assert element is invalid
   */
  async toBeInvalid(): Promise<void> {
    await expect(this._locator).toHaveJSProperty("validity.valid", false);
  }

  /**
   * Assert element is checked (for checkboxes/radio buttons)
   */
  async toBeChecked(): Promise<void> {
    await expect(this._locator).toBeChecked();
  }

  /**
   * Assert element is not checked
   */
  async notToBeChecked(): Promise<void> {
    await expect(this._locator).not.toBeChecked();
  }

  /**
   * Assert element is partially checked (for checkboxes)
   */
  async toBePartiallyChecked(): Promise<void> {
    await expect(this._locator).toHaveJSProperty("indeterminate", true);
  }

  /**
   * Assert element has focus
   */
  async toHaveFocus(): Promise<void> {
    await expect(this._locator).toBeFocused();
  }

  /**
   * Assert element does not have focus
   */
  async notToHaveFocus(): Promise<void> {
    await expect(this._locator).not.toBeFocused();
  }

  /**
   * Assert element has a specific role
   */
  async toHaveRole(role: string): Promise<void> {
    await expect(this._locator).toHaveAttribute("role", role);
  }

  /**
   * Assert element has a specific accessible name
   */
  async toHaveAccessibleName(name: string): Promise<void> {
    await expect(this._locator).toHaveAttribute("aria-label", name);
  }

  /**
   * Assert element has a specific accessible description
   */
  async toHaveAccessibleDescription(description: string): Promise<void> {
    // Check for aria-describedby first
    const ariaDescribedBy = await this._locator.getAttribute("aria-describedby");
    if (ariaDescribedBy) {
      const describedElement = this._locator.page().locator(`#${ariaDescribedBy}`);
      await expect(describedElement).toHaveText(description);
      return;
    }

    // Check for title attribute
    const title = await this._locator.getAttribute("title");
    if (title) {
      expect(title).toBe(description);
      return;
    }

    // If neither exists, fail
    throw new Error(`Element does not have accessible description: ${description}`);
  }

  /**
   * Assert element has specific classes
   */
  async toHaveClasses(...classes: string[]): Promise<void> {
    for (const className of classes) {
      await expect(this._locator).toHaveClass(new RegExp(className));
    }
  }

  /**
   * Assert element has specific attributes
   */
  async toHaveAttributes(attributes: Record<string, string>): Promise<void> {
    for (const [name, value] of Object.entries(attributes)) {
      await expect(this._locator).toHaveAttribute(name, value);
    }
  }

  /**
   * Assert element has specific text content
   */
  async toHaveTextContent(text: string): Promise<void> {
    await expect(this._locator).toHaveText(text);
  }

  /**
   * Assert element contains specific text
   */
  async toContainText(text: string): Promise<void> {
    await expect(this._locator).toContainText(text);
  }

  /**
   * Focus the element
   */
  async focus(): Promise<void> {
    await this._locator.focus();
  }

  /**
   * Click the element
   */
  async click(): Promise<void> {
    await this._locator.click();
  }

  /**
   * Type text into the element
   */
  async type(text: string): Promise<void> {
    await this._locator.fill(text);
  }

  /**
   * Get the element's text content
   */
  async getTextContent(): Promise<string> {
    return (await this._locator.textContent()) || "";
  }

  /**
   * Get the element's attribute value
   */
  async getAttribute(name: string): Promise<string | null> {
    return await this._locator.getAttribute(name);
  }

  /**
   * Check if element is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await expect(this._locator).toBeVisible({ timeout: 100 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is attached to DOM
   */
  async isAttached(): Promise<boolean> {
    try {
      await expect(this._locator).toBeAttached({ timeout: 100 });
      return true;
    } catch {
      return false;
    }
  }
}
