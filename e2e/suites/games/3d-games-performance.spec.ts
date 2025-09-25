/**
 * 3D Games Performance E2E Tests
 *
 * Tests for 3D games performance including
 * rendering performance and multiple game instances.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Performance", () => {
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

  test("should maintain 3D rendering performance", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });
    if ((await gameButtons.count()) > 0) {
      await gameButtons.first().click();
      await page.waitForTimeout(2000);

      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();

      // Measure performance during interactions
      const startTime = Date.now();

      // Perform multiple interactions
      for (let i = 0; i < 20; i++) {
        await gameContainer.click({
          position: {
            x: 100 + i * 10,
            y: 100 + i * 10,
          },
        });
        await page.waitForTimeout(50);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000);

      await expect(gameContainer).toBeVisible();
    }
  });

  test("should handle multiple game instances", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });

    if ((await gameButtons.count()) >= 2) {
      // Switch between games multiple times
      for (let i = 0; i < 3; i++) {
        await gameButtons.first().click();
        await page.waitForTimeout(500);

        await gameButtons.nth(1).click();
        await page.waitForTimeout(500);
      }

      // Should still be functional
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });
});
