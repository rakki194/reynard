/**
 * Games Demo Stress Performance E2E Tests
 * 
 * Performance-focused tests for stress testing and extended usage scenarios.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Games Demo Stress Performance", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should handle extended gameplay", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#roguelike`, { waitUntil: "networkidle" });
    
    const gameElement = page.locator(".main-game, canvas, [data-testid='roguelike-game']");
    await expect(gameElement).toBeVisible();
    
    const startTime = Date.now();
    
    // Extended gameplay simulation
    for (let i = 0; i < 100; i++) {
      await gameElement.click({ 
        position: { 
          x: 100 + (i % 10) * 20, 
          y: 100 + (i % 10) * 20 
        } 
      });
      await page.waitForTimeout(50);
      
      // Test keyboard input periodically
      if (i % 10 === 0) {
        await gameElement.focus();
        await page.keyboard.press("ArrowUp");
      }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle extended gameplay
    expect(totalTime).toBeLessThan(30000);
    
    // Game should still be responsive
    await expect(gameElement).toBeVisible();
  });

  test("should handle multiple game switches", async () => {
    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });
    
    const startTime = Date.now();
    
    // Switch between games multiple times
    for (let i = 0; i < 20; i++) {
      await page.locator(".game-card").first().click();
      await page.waitForTimeout(500);
      
      await page.goBack();
      await page.waitForLoadState("networkidle");
      
      await page.locator(".game-card").nth(1).click();
      await page.waitForTimeout(500);
      
      await page.goBack();
      await page.waitForLoadState("networkidle");
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle multiple switches efficiently
    expect(totalTime).toBeLessThan(60000);
    
    // Should still be functional
    await expect(page.locator("h1")).toContainText("Reynard Games Demo");
  });
});
