/**
 * Authentication Accessibility Tests for Reynard
 *
 * Tests focused on accessibility and usability
 */

import { expect, test } from "@playwright/test";
import { getFocusedElementTag, navigateToAuthPage, setMobileViewport, testKeyboardNavigation } from "./auth-helpers";

test.describe("Authentication Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuthPage(page);
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    const inputs = page.locator("input:not([type='checkbox'])");
    const inputCount = await inputs.count();

    if (inputCount === 0) {
      test.skip();
      return;
    }

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute("id");
      const hasLabel = await input.getAttribute("aria-label");
      const hasLabelElement = inputId ? (await page.locator(`label[for="${inputId}"]`).count()) > 0 : false;

      expect(hasLabel || hasLabelElement).toBeTruthy();
    }
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await setMobileViewport(page);
    await expect(page.locator("#identifier")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await testKeyboardNavigation(page);

    const focusedElement = await getFocusedElementTag(page);
    expect(["INPUT", "BUTTON"]).toContain(focusedElement);
  });
});
