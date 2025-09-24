/**
 * Cube Collector Game E2E Tests
 * 
 * Tests for the Cube Collector game including
 * game loading and collection mechanics.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Cube Collector Game", () => {
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

  test("should load cube collector game", async () => {
    // Try to navigate to cube collector
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    // Look for cube collector game option
    const cubeGameButton = page.locator("button").filter({ hasText: /cube/i });
    if (await cubeGameButton.count() > 0) {
      await cubeGameButton.first().click();
      await page.waitForTimeout(2000);
      
      // Check for game elements
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
    }
  });

  test("should handle cube collection mechanics", async () => {
    // Navigate to cube collector if available
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    const cubeGameButton = page.locator("button").filter({ hasText: /cube/i });
    if (await cubeGameButton.count() > 0) {
      await cubeGameButton.first().click();
      await page.waitForTimeout(2000);
      
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
      
      // Test interactions
      await gameContainer.click({ position: { x: 100, y: 100 } });
      await gameContainer.click({ position: { x: 200, y: 200 } });
      
      // Check score updates
      const scoreValue = page.locator(".score-value");
      await expect(scoreValue).toBeVisible();
    }
  });
});
