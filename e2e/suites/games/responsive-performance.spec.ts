/**
 * Games Demo Responsive Performance E2E Tests
 * 
 * Performance-focused tests for responsive design and viewport handling.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Games Demo Responsive Performance", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should handle viewport changes efficiently", async () => {
    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });
    
    const startTime = Date.now();
    
    // Test multiple viewport sizes
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1280, height: 720 },  // Desktop
      { width: 1920, height: 1080 }  // Large desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle viewport changes efficiently
    expect(totalTime).toBeLessThan(2000);
    
    // Page should still be functional
    await expect(page.locator("h1")).toContainText("Reynard Games Demo");
  });

  test("should maintain performance on mobile", async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });
    
    const startTime = Date.now();
    
    // Test mobile interactions
    const gameCards = page.locator(".game-card");
    await expect(gameCards).toHaveCount(2);
    
    await gameCards.first().click();
    await page.waitForTimeout(1000);
    
    await page.goBack();
    await page.waitForLoadState("networkidle");
    
    await gameCards.nth(1).click();
    await page.waitForTimeout(1000);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should perform well on mobile
    expect(totalTime).toBeLessThan(10000);
  });
});
