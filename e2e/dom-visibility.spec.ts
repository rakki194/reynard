/**
 * DOM Visibility Tests
 * 
 * Tests for element visibility assertions using Playwright.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { loadDomTestPage } from "./utils/dom-test-helpers";

test.describe("DOM Element Visibility", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect visible elements", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).toBeVisible();
  });

  test("should detect hidden elements", async ({ page }) => {
    const element = page.locator("#hidden-element");
    await expect(element).toBeHidden();
  });

  test("should detect invisible elements", async ({ page }) => {
    const element = page.locator("#invisible-element");
    await expect(element).toBeHidden();
  });

  test("should detect transparent elements", async ({ page }) => {
    const element = page.locator("#transparent-element");
    // Elements with opacity: 0 are still considered visible by Playwright
    // because they take up space, so we check the computed opacity instead
    await expect(element).toHaveCSS("opacity", "0");
  });

  test("should handle dynamic visibility changes", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).toBeVisible();
    
    // Hide the element
    await page.evaluate(() => {
      const element = document.getElementById("visible-element");
      if (element) element.style.display = "none";
    });
    
    await expect(element).toBeHidden();
  });
});
