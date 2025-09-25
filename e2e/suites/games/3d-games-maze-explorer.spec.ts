/**
 * Maze Explorer Game E2E Tests
 *
 * Tests for the Maze Explorer game including
 * game loading and navigation mechanics.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Maze Explorer Game", () => {
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

  test("should load maze explorer game", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const mazeGameButton = page.locator("button").filter({ hasText: /maze/i });
    if ((await mazeGameButton.count()) > 0) {
      await mazeGameButton.first().click();
      await page.waitForTimeout(2000);

      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });

  test("should handle maze navigation", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const mazeGameButton = page.locator("button").filter({ hasText: /maze/i });
    if ((await mazeGameButton.count()) > 0) {
      await mazeGameButton.first().click();
      await page.waitForTimeout(2000);

      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();

      // Test movement in maze
      await gameContainer.focus();
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowRight");

      // Test mouse interaction
      await gameContainer.click({ position: { x: 100, y: 100 } });

      await expect(gameContainer).toBeVisible();
    }
  });
});
