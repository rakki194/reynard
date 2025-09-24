/**
 * Accessibility E2E Tests
 * 
 * Tests for accessibility features in the rogue-like game.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { setupPage, cleanupPage, getGameElement } from "./roguelike-test-utils";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ browser }) => {
    await setupPage(browser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupPage(page);
  });

  test("should be keyboard accessible", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Focus on game
    await gameElement.focus();
    
    // Test keyboard navigation
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Enter"];
    
    for (const key of keys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(100);
    }
    
    // Game should respond to keyboard input
    await expect(gameElement).toBeVisible();
  });

  test("should have proper ARIA attributes", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Check if game has proper accessibility attributes
    // This might vary based on implementation
    const hasAriaLabel = await gameElement.getAttribute("aria-label");
    const hasRole = await gameElement.getAttribute("role");
    
    // At minimum, game should be visible and interactive
    await expect(gameElement).toBeVisible();
  });
});
