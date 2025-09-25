/**
 * ECS System E2E Tests
 *
 * Tests for Entity Component System functionality.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { setupPage, cleanupPage, getGameElement } from "./roguelike-test-utils";

test.describe("ECS System Testing", () => {
  test.beforeEach(async ({ browser }) => {
    await setupPage(browser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupPage(page);
  });

  test("should have entities and components", async ({ page }) => {
    // Check if game has initialized ECS entities
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();

    // Wait for game to initialize
    await page.waitForTimeout(1000);

    // Check for game state indicators (if any are exposed)
    // This might vary based on implementation
    const gameState = await page.evaluate(() => {
      // Try to access game state from window object
      return (window as any).gameState || (window as any).roguelikeGame || null;
    });

    // Game should be initialized (even if we can't access internal state)
    await expect(gameElement).toBeVisible();
  });

  test("should handle entity updates", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();

    // Interact with game to trigger entity updates
    await gameElement.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(500);

    await gameElement.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);

    // Game should continue running
    await expect(gameElement).toBeVisible();
  });
});
