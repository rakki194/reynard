/**
 * Authentication Validation Tests for Reynard
 *
 * Tests focused on form validation and error handling
 */

import { expect, test } from "@playwright/test";
import { expectSubmitButtonDisabled, hasValidationMechanisms, navigateToAuthPage } from "./auth-helpers";

test.describe("Authentication Validation Tests", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuthPage(page);
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    await expectSubmitButtonDisabled(page);

    const hasValidation = await hasValidationMechanisms(page);
    expect(hasValidation).toBeTruthy();
  });
});
