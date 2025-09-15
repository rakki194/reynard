/**
 * DOM Assertion Helpers for Playwright E2E Tests
 *
 * Reusable utilities for DOM element assertions in Playwright tests.
 * These helpers provide a consistent API for testing DOM behavior.
 *
 * @author 🦊 The Cunning Fox
 */

import { Page } from "@playwright/test";
import { DOMElementAssertions } from "./dom-element-assertions";

/**
 * DOM Assertion Helper Class
 * Provides a fluent API for DOM element assertions
 */
export class DOMAssertions {
  constructor(private readonly page: Page) {}

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
 * Create a DOM assertions helper for a page
 */
export function createDOMAssertions(page: Page): DOMAssertions {
  return new DOMAssertions(page);
}
