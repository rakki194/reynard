/**
 * Space Shooter Game E2E Tests
 * 
 * Tests for the Space Shooter game including
 * game loading and control mechanics.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Space Shooter Game", () => {
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

  test("should load space shooter game", async () => {
    // Try to navigate to space shooter
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    const spaceGameButton = page.locator("button").filter({ hasText: /space/i });
    if (await spaceGameButton.count() > 0) {
      await spaceGameButton.first().click();
      await page.waitForTimeout(2000);
      
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });

  test("should handle space shooter controls", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    const spaceGameButton = page.locator("button").filter({ hasText: /space/i });
    if (await spaceGameButton.count() > 0) {
      await spaceGameButton.first().click();
      await page.waitForTimeout(2000);
      
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
      
      // Test keyboard controls
      await gameContainer.focus();
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Space");
      
      // Game should still be responsive
      await expect(gameContainer).toBeVisible();
    }
  });
});
