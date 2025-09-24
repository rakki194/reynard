/**
 * Performance E2E Tests
 * 
 * Tests for game performance and responsiveness.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { setupPage, cleanupPage, getGameElement } from "./roguelike-test-utils";

test.describe("Performance", () => {
  test.beforeEach(async ({ browser }) => {
    await setupPage(browser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupPage(page);
  });

  test("should maintain performance during gameplay", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Measure initial performance
    const startTime = Date.now();
    
    // Perform multiple interactions
    for (let i = 0; i < 10; i++) {
      await gameElement.click({ 
        position: { 
          x: 100 + (i * 20), 
          y: 100 + (i * 20) 
        } 
      });
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete interactions within reasonable time
    expect(totalTime).toBeLessThan(5000);
    
    // Game should still be responsive
    await expect(gameElement).toBeVisible();
  });

  test("should handle rapid input", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Rapid clicking
    const rapidClicks = Array.from({ length: 20 }, (_, i) => ({
      x: 100 + (i * 10),
      y: 100 + (i * 10)
    }));
    
    for (const click of rapidClicks) {
      await gameElement.click({ position: click });
    }
    
    // Game should handle rapid input gracefully
    await expect(gameElement).toBeVisible();
  });
});
