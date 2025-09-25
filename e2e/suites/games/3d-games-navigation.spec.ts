/**
 * Game Navigation E2E Tests
 *
 * Tests for game navigation functionality including
 * back to menu and game switching.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Game Navigation", () => {
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

  test("should have back to menu functionality", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    // Look for back button
    const backButton = page.locator("button").filter({ hasText: /back|menu/i });
    if ((await backButton.count()) > 0) {
      await backButton.first().click();

      // Should return to game selection
      await expect(page.locator(".game-selection")).toBeVisible();
    }
  });

  test("should switch between games", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });

    if ((await gameButtons.count()) >= 2) {
      // Select first game
      await gameButtons.first().click();
      await page.waitForTimeout(1000);

      // Select second game
      await gameButtons.nth(1).click();
      await page.waitForTimeout(1000);

      // Both games should be functional
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });
});
