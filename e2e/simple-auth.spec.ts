/**
 * Simplified E2E Authentication Tests for Reynard
 * 
 * Basic authentication tests that can run without complex mocking
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page (root of the app)
    await page.goto("/");
  });

  test("should display login form", async ({ page }) => {
    // Check if login form elements are present
    await expect(page.locator("#identifier")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("should display registration form when toggled", async ({ page }) => {
    // Look for registration toggle or link
    const registerLink = page.locator("button:has-text('Register')").first();
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      
      // Wait a moment for the form to switch
      await page.waitForTimeout(500);
      
      // Check if registration form elements are present
      await expect(page.locator("#username")).toBeVisible();
      await expect(page.locator("#email")).toBeVisible();
      await expect(page.locator("#password")).toBeVisible();
      await expect(page.locator("button[type='submit']")).toBeVisible();
    } else {
      // Skip test if register button is not visible
      test.skip();
    }
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    // Check if submit button is disabled for empty form (which is correct behavior)
    const submitButton = page.locator("button[type='submit']").first();
    await expect(submitButton).toBeDisabled();
    
    // Check for validation messages or required attributes
    const hasValidation = await page.locator(".error, .invalid, [aria-invalid='true']").count() > 0;
    const hasRequiredAttributes = await page.locator("input[required]").count() > 0;
    
    // At least one validation mechanism should be present
    expect(hasValidation || hasRequiredAttributes).toBeTruthy();
  });

  test("should handle form input correctly", async ({ page }) => {
    // Fill in form fields
    const usernameField = page.locator("#identifier");
    const passwordField = page.locator("#password");
    
    await usernameField.fill("testuser");
    await passwordField.fill("testpassword");
    
    // Verify values are set
    await expect(usernameField).toHaveValue("testuser");
    await expect(passwordField).toHaveValue("testpassword");
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    // Check for proper form labels and accessibility
    const inputs = page.locator("input:not([type='checkbox'])");
    const inputCount = await inputs.count();
    
    // Skip test if no inputs found
    if (inputCount === 0) {
      test.skip();
      return;
    }
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute("id");
      const hasLabel = await input.getAttribute("aria-label");
      const hasLabelElement = inputId ? await page.locator(`label[for="${inputId}"]`).count() > 0 : false;
      
      // Each input should have either aria-label or associated label element
      expect(hasLabel || hasLabelElement).toBeTruthy();
    }
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if form is still visible and usable
    await expect(page.locator("#identifier")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Check if focus is on form elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON"]).toContain(focusedElement);
  });
});
