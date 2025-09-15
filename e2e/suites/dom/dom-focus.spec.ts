/**
 * DOM Focus Management Tests
 * 
 * Tests for element focus and focus management.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { loadDomTestPage } from "../../modules/dom";

test.describe("DOM Focus Management", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect focused elements", async ({ page }) => {
    const element = page.locator("#focusable-button");
    await element.focus();
    await expect(element).toBeFocused();
  });

  test("should detect unfocused elements", async ({ page }) => {
    const element = page.locator("#focusable-button");
    await expect(element).not.toBeFocused();
  });

  test("should handle focus changes", async ({ page }) => {
    const button1 = page.locator("#focusable-button");
    const button2 = page.locator("#titled-button"); // Use another focusable button instead of disabled one
    
    await button1.focus();
    await expect(button1).toBeFocused();
    await expect(button2).not.toBeFocused();
    
    await button2.focus();
    await expect(button2).toBeFocused();
    await expect(button1).not.toBeFocused();
  });
});
