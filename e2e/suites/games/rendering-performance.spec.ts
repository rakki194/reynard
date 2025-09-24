/**
 * Games Demo Rendering Performance E2E Tests
 * 
 * Performance-focused tests for rendering and visual performance.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Games Demo Rendering Performance", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render main menu smoothly", async () => {
    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });
    
    // Measure rendering performance
    const renderMetrics = await page.evaluate(() => {
      const start = performance.now();
      
      // Force a reflow/repaint
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
      
      const end = performance.now();
      return end - start;
    });
    
    // Rendering should be fast
    expect(renderMetrics).toBeLessThan(100);
  });

  test("should render game components efficiently", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#roguelike`, { waitUntil: "networkidle" });
    
    // Wait for game to initialize
    await page.waitForTimeout(2000);
    
    const gameElement = page.locator(".main-game, canvas, [data-testid='roguelike-game']");
    await expect(gameElement).toBeVisible();
    
    // Measure game rendering performance
    const gameRenderTime = await page.evaluate(() => {
      const start = performance.now();
      
      // Trigger game update
      const event = new Event('resize');
      window.dispatchEvent(event);
      
      const end = performance.now();
      return end - start;
    });
    
    // Game rendering should be efficient
    expect(gameRenderTime).toBeLessThan(50);
  });

  test("should handle 3D rendering performance", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    
    // Look for 3D game buttons
    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });
    if (await gameButtons.count() > 0) {
      await gameButtons.first().click();
      await page.waitForTimeout(2000);
      
      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();
      
      // Measure 3D rendering performance
      const renderTime = await page.evaluate(() => {
        const start = performance.now();
        
        // Trigger 3D scene update
        const event = new Event('resize');
        window.dispatchEvent(event);
        
        const end = performance.now();
        return end - start;
      });
      
      // 3D rendering should be efficient
      expect(renderTime).toBeLessThan(100);
    }
  });
});
