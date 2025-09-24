/**
 * Games Demo Loading Performance E2E Tests
 * 
 * Performance-focused tests for loading times and navigation.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Games Demo Loading Performance", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should load main menu within acceptable time", async () => {
    const startTime = Date.now();
    
    await page.goto(GAMES_DEMO_URL, { 
      waitUntil: "networkidle",
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Verify page loaded correctly
    await expect(page.locator("h1")).toContainText("Reynard Games Demo");
  });

  test("should load rogue-like game within acceptable time", async () => {
    const startTime = Date.now();
    
    await page.goto(`${GAMES_DEMO_URL}/#roguelike`, { 
      waitUntil: "networkidle",
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (games take longer)
    expect(loadTime).toBeLessThan(5000);
    
    // Verify game loaded
    await expect(page.locator("h1")).toContainText("Reynard Rogue-like");
  });

  test("should load 3D games within acceptable time", async () => {
    const startTime = Date.now();
    
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { 
      waitUntil: "networkidle",
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Verify 3D games loaded
    await expect(page.locator("h1")).toContainText("Reynard 3D Games");
  });

  test("should handle concurrent navigation", async () => {
    const startTime = Date.now();
    
    // Navigate to multiple pages quickly
    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });
    await page.goto(`${GAMES_DEMO_URL}/#roguelike`, { waitUntil: "networkidle" });
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });
    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });
    
    const totalTime = Date.now() - startTime;
    
    // Should handle multiple navigations within reasonable time
    expect(totalTime).toBeLessThan(15000);
  });
});
