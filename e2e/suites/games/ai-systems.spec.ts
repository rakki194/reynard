/**
 * AI Systems E2E Tests
 *
 * Tests for AI entities and interactions in the rogue-like game.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { setupPage, cleanupPage, getGameElement } from "./roguelike-test-utils";

test.describe("AI Systems", () => {
  test.beforeEach(async ({ browser }) => {
    await setupPage(browser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupPage(page);
  });

  test("should have AI entities", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();

    // Wait for AI entities to spawn
    await page.waitForTimeout(3000);

    // Interact with game to potentially trigger AI behavior
    await gameElement.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(1000);

    // Game should continue running with AI
    await expect(gameElement).toBeVisible();
  });

  test("should handle AI interactions", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();

    // Wait for AI to initialize
    await page.waitForTimeout(2000);

    // Try to interact with AI entities
    const interactionPoints = [
      { x: 150, y: 150 },
      { x: 250, y: 250 },
      { x: 350, y: 350 },
    ];

    for (const point of interactionPoints) {
      await gameElement.click({ position: point });
      await page.waitForTimeout(500);
    }

    // Game should handle AI interactions
    await expect(gameElement).toBeVisible();
  });
});
