/**
 * Error Handling E2E Tests
 *
 * Tests for error handling and recovery in the rogue-like game.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { setupPage, cleanupPage, getGameElement } from "./roguelike-test-utils";

test.describe("Error Handling", () => {
  test.beforeEach(async ({ browser }) => {
    await setupPage(browser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupPage(page);
  });

  test("should handle invalid game interactions", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();

    // Try clicking outside game bounds
    await gameElement.click({ position: { x: -100, y: -100 } });
    await gameElement.click({ position: { x: 2000, y: 2000 } });

    // Game should handle gracefully
    await expect(gameElement).toBeVisible();
  });

  test("should recover from errors", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();

    // Try to trigger potential errors
    await page.keyboard.press("F12"); // Dev tools
    await page.keyboard.press("F5"); // Refresh

    // Wait a bit
    await page.waitForTimeout(1000);

    // Game should still be functional
    await expect(gameElement).toBeVisible();
  });
});
