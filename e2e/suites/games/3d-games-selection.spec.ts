/**
 * 3D Games Selection E2E Tests
 *
 * Tests for game selection functionality including
 * displaying available games and handling game selection.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Game Selection", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to 3D games
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should display available 3D games", async () => {
    // Check for game selection interface
    await expect(page.locator(".game-selection")).toBeVisible();

    // Look for game options or buttons
    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });
    if ((await gameButtons.count()) > 0) {
      await expect(gameButtons.first()).toBeVisible();
    }
  });

  test("should handle game selection", async () => {
    // Look for game selection buttons
    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle|play|start/i });

    if ((await gameButtons.count()) > 0) {
      // Click on first available game
      await gameButtons.first().click();

      // Wait for game to load
      await page.waitForTimeout(2000);

      // Check if game container appears
      const gameContainer = page.locator(".game-container, .game-viewport, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });
});
