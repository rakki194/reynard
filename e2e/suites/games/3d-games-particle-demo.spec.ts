/**
 * Particle Demo E2E Tests
 *
 * Tests for the Particle Demo including
 * game loading and particle interactions.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Particle Demo", () => {
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

  test("should load particle demo", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const particleGameButton = page.locator("button").filter({ hasText: /particle/i });
    if ((await particleGameButton.count()) > 0) {
      await particleGameButton.first().click();
      await page.waitForTimeout(2000);

      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });

  test("should handle particle interactions", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const particleGameButton = page.locator("button").filter({ hasText: /particle/i });
    if ((await particleGameButton.count()) > 0) {
      await particleGameButton.first().click();
      await page.waitForTimeout(2000);

      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();

      // Test particle interactions
      await gameContainer.click({ position: { x: 100, y: 100 } });
      await gameContainer.click({ position: { x: 200, y: 200 } });
      await gameContainer.click({ position: { x: 300, y: 300 } });

      // Test mouse movement for particle effects
      await gameContainer.hover({ position: { x: 150, y: 150 } });
      await gameContainer.hover({ position: { x: 250, y: 250 } });

      await expect(gameContainer).toBeVisible();
    }
  });
});
