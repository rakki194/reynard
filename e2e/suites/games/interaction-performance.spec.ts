/**
 * Games Demo Interaction Performance E2E Tests
 * 
 * Performance-focused tests for user interactions and input handling.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Games Demo Interaction Performance", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should handle rapid clicks efficiently", async () => {
    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });
    
    const gameCard = page.locator(".game-card").first();
    await expect(gameCard).toBeVisible();
    
    const startTime = Date.now();
    
    // Perform rapid clicks
    for (let i = 0; i < 50; i++) {
      await gameCard.click();
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle rapid clicks efficiently
    expect(totalTime).toBeLessThan(5000);
  });

  test("should handle keyboard input efficiently", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#roguelike`, { waitUntil: "networkidle" });
    
    const gameElement = page.locator(".main-game, canvas, [data-testid='roguelike-game']");
    await expect(gameElement).toBeVisible();
    
    await gameElement.focus();
    
    const startTime = Date.now();
    
    // Perform rapid keyboard input
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
    for (let i = 0; i < 100; i++) {
      const key = keys[i % keys.length];
      await page.keyboard.press(key);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle keyboard input efficiently
    expect(totalTime).toBeLessThan(10000);
  });

  test("should handle mouse movement efficiently", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });
    if (await gameButtons.count() > 0) {
      await gameButtons.first().click();
      await page.waitForTimeout(2000);
      
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
      
      const startTime = Date.now();
      
      // Perform rapid mouse movements
      for (let i = 0; i < 50; i++) {
        await gameContainer.hover({ 
          position: { 
            x: 100 + (i * 5), 
            y: 100 + (i * 5) 
          } 
        });
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should handle mouse movement efficiently
      expect(totalTime).toBeLessThan(5000);
    }
  });
});
