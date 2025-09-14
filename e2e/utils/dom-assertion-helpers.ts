/**
 * DOM Assertion Helpers for Playwright E2E Tests
 * 
 * Reusable utilities for DOM element assertions in Playwright tests.
 * These helpers provide a consistent API for testing DOM behavior.
 * 
 * @author 🦊 The Cunning Fox
 */

import { expect, Locator, Page } from "@playwright/test";

/**
 * DOM Assertion Helper Class
 * Provides a fluent API for DOM element assertions
 */
export class DOMAssertions {
  constructor(private page: Page) {}

  /**
   * Get a locator for an element
   */
  element(selector: string): DOMElementAssertions {
    return new DOMElementAssertions(this.page.locator(selector));
  }

  /**
   * Get a locator for an element by ID
   */
  byId(id: string): DOMElementAssertions {
    return new DOMElementAssertions(this.page.locator(`#${id}`));
  }

  /**
   * Get a locator for an element by class
   */
  byClass(className: string): DOMElementAssertions {
    return new DOMElementAssertions(this.page.locator(`.${className}`));
  }

  /**
   * Get a locator for an element by data-testid
   */
  byTestId(testId: string): DOMElementAssertions {
    return new DOMElementAssertions(this.page.locator(`[data-testid="${testId}"]`));
  }

  /**
   * Get a locator for an element by role
   */
  byRole(role: string): DOMElementAssertions {
    return new DOMElementAssertions(this.page.locator(`[role="${role}"]`));
  }
}

/**
 * DOM Element Assertions Class
 * Provides specific assertions for individual DOM elements
 */
export class DOMElementAssertions {
  constructor(private _locator: Locator) {}

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
    return await this._locator.textContent() || "";
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

/**
 * Create a DOM assertions helper for a page
 */
export function createDOMAssertions(page: Page): DOMAssertions {
  return new DOMAssertions(page);
}

/**
 * Utility function to create a test page with common DOM elements
 */
export async function createTestPage(page: Page): Promise<void> {
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>DOM Assertions Test Page</title>
        <style>
          .hidden { display: none; }
          .sr-only { position: absolute; left: -10000px; }
          .visible { display: block; }
          .invisible { visibility: hidden; }
          .transparent { opacity: 0; }
          .focusable { outline: 2px solid blue; }
        </style>
      </head>
      <body>
        <div id="test-container">
          <!-- Basic elements -->
          <div id="visible-element" class="visible">Visible Element</div>
          <div id="hidden-element" class="hidden">Hidden Element</div>
          <div id="invisible-element" class="invisible">Invisible Element</div>
          <div id="transparent-element" class="transparent">Transparent Element</div>
          
          <!-- Form elements -->
          <input id="text-input" type="text" value="Test Input" />
          <input id="disabled-input" type="text" disabled />
          <input id="required-input" type="text" required />
          <input id="invalid-input" type="email" value="invalid-email" />
          <input id="valid-input" type="email" value="test@example.com" />
          
          <!-- Checkboxes -->
          <input id="checked-checkbox" type="checkbox" checked />
          <input id="unchecked-checkbox" type="checkbox" />
          <input id="partial-checkbox" type="checkbox" />
          
          <!-- Buttons -->
          <button id="focusable-button" class="focusable">Focusable Button</button>
          <button id="disabled-button" disabled>Disabled Button</button>
          
          <!-- Elements with roles -->
          <div id="button-role" role="button">Button Role</div>
          <div id="link-role" role="link">Link Role</div>
          
          <!-- Elements with accessible names -->
          <button id="named-button" aria-label="Submit Form">Submit</button>
          <input id="labeled-input" aria-label="Email Address" type="email" />
          
          <!-- Elements with accessible descriptions -->
          <input id="described-input" aria-describedby="description" type="email" />
          <div id="description">Enter your email address</div>
          
          <!-- Elements with titles -->
          <button id="titled-button" title="Click to submit">Submit</button>
          
          <!-- Elements with classes -->
          <div id="multi-class" class="class1 class2 class3">Multi Class</div>
          
          <!-- Elements with attributes -->
          <div id="attributed-element" data-testid="test-element" data-value="123">Attributed</div>
          
          <!-- Elements not in document -->
          <div id="removable-element">Will be removed</div>
        </div>
      </body>
    </html>
  `);
  
  // Set indeterminate state for the partial checkbox via JavaScript
  await page.evaluate(() => {
    const checkbox = document.getElementById("partial-checkbox") as HTMLInputElement;
    if (checkbox) {
      checkbox.indeterminate = true;
    }
  });
}
