/**
 * 3D Games Error Handling E2E Tests
 * 
 * Tests for error handling in 3D games including
 * WebGL errors and game recovery.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Error Handling", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to 3D games
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { 
      waitUntil: "networkidle",
      timeout: 30000 
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should handle WebGL errors gracefully", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    // Try to trigger potential WebGL errors
    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });
    if (await gameButtons.count() > 0) {
      await gameButtons.first().click();
      await page.waitForTimeout(2000);
      
      // Rapid interactions that might cause issues
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
      
      for (let i = 0; i < 10; i++) {
        await gameContainer.click({ position: { x: Math.random() * 400, y: Math.random() * 400 } });
      }
      
      // Should handle gracefully
      await expect(gameContainer).toBeVisible();
    }
  });

  test("should recover from game errors", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });
    if (await gameButtons.count() > 0) {
      await gameButtons.first().click();
      await page.waitForTimeout(2000);
      
      // Try to cause potential errors
      await page.keyboard.press("F12");
      await page.keyboard.press("F5");
      await page.waitForTimeout(1000);
      
      // Should recover
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });
});
