/**
 * Authentication Test Helpers for Reynard E2E Tests
 *
 * Reusable utilities for authentication testing scenarios
 */

import { Page, expect } from "@playwright/test";

/**
 * Navigate to the authentication page
 */
export const navigateToAuthPage = async (page: Page): Promise<void> => {
  await page.goto("/");
};

/**
 * Check if login form elements are visible
 */
export const expectLoginFormVisible = async (page: Page): Promise<void> => {
  await expect(page.locator("#identifier")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.locator("button[type='submit']")).toBeVisible();
};

/**
 * Check if registration form elements are visible
 */
export const expectRegistrationFormVisible = async (page: Page): Promise<void> => {
  await expect(page.locator("#username")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.locator("button[type='submit']")).toBeVisible();
};

/**
 * Fill in login form fields
 */
export const fillLoginForm = async (
  page: Page,
  username: string = "testuser",
  password: string = "testpassword"
): Promise<void> => {
  const usernameField = page.locator("#identifier");
  const passwordField = page.locator("#password");

  await usernameField.fill(username);
  await passwordField.fill(password);
};

/**
 * Verify form field values
 */
export const expectFormValues = async (
  page: Page,
  username: string = "testuser",
  password: string = "testpassword"
): Promise<void> => {
  await expect(page.locator("#identifier")).toHaveValue(username);
  await expect(page.locator("#password")).toHaveValue(password);
};

/**
 * Check if submit button is disabled (for validation testing)
 */
export const expectSubmitButtonDisabled = async (page: Page): Promise<void> => {
  const submitButton = page.locator("button[type='submit']").first();
  await expect(submitButton).toBeDisabled();
};

/**
 * Check for validation mechanisms
 */
export const hasValidationMechanisms = async (page: Page): Promise<boolean> => {
  const hasValidation = (await page.locator(".error, .invalid, [aria-invalid='true']").count()) > 0;
  const hasRequiredAttributes = (await page.locator("input[required]").count()) > 0;

  return hasValidation || hasRequiredAttributes;
};

/**
 * Set mobile viewport for responsive testing
 */
export const setMobileViewport = async (page: Page): Promise<void> => {
  await page.setViewportSize({ width: 375, height: 667 });
};

/**
 * Test keyboard navigation
 */
export const testKeyboardNavigation = async (page: Page): Promise<void> => {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
};

/**
 * Get the currently focused element tag name
 */
export const getFocusedElementTag = async (page: Page): Promise<string | null> => {
  return await page.evaluate(() => document.activeElement?.tagName || null);
};
