/**
 * DOM Element Presence Tests
 *
 * Tests for element presence and attachment assertions.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { loadDomTestPage, removeElement } from "../../modules/dom";

test.describe("DOM Element Presence", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect elements in document", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).toBeAttached();
  });

  test("should detect elements not in document", async ({ page }) => {
    const element = page.locator("#removable-element");
    await expect(element).toBeAttached();

    // Remove the element
    await removeElement(page, "#removable-element");

    await expect(element).not.toBeAttached();
  });

  test("should handle non-existent elements", async ({ page }) => {
    const element = page.locator("#non-existent");
    await expect(element).not.toBeAttached();
  });

  test("should handle invalid selectors gracefully", async ({ page }) => {
    // This should not throw an error - use a valid but non-existent selector
    const element = page.locator("[data-testid='non-existent-element']");
    await expect(element).not.toBeAttached();
  });
});
