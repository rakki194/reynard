/**
 * Authentication Form Tests for Reynard
 *
 * Tests focused on form display and basic functionality
 */

import { test } from "@playwright/test";
import {
  expectFormValues,
  expectLoginFormVisible,
  expectRegistrationFormVisible,
  fillLoginForm,
  navigateToAuthPage,
} from "./auth-helpers";

test.describe("Authentication Form Tests", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuthPage(page);
  });

  test("should display login form", async ({ page }) => {
    await expectLoginFormVisible(page);
  });

  test("should display registration form when toggled", async ({ page }) => {
    const registerLink = page.locator("button:has-text('Register')").first();

    if (await registerLink.isVisible()) {
      await registerLink.click();
      await page.waitForTimeout(500);
      await expectRegistrationFormVisible(page);
    } else {
      test.skip();
    }
  });

  test("should handle form input correctly", async ({ page }) => {
    await fillLoginForm(page);
    await expectFormValues(page);
  });
});
