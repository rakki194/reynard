/**
 * Game Mechanics E2E Tests
 * 
 * Tests for rogue-like game mechanics and interactions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { setupPage, cleanupPage, getGameElement } from "./roguelike-test-utils";

test.describe("Game Mechanics", () => {
  test.beforeEach(async ({ browser }) => {
    await setupPage(browser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupPage(page);
  });

  test("should handle game interactions", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Test clicking on game area
    await gameElement.click({ position: { x: 100, y: 100 } });
    
    // Test multiple clicks for movement/interaction
    await gameElement.click({ position: { x: 200, y: 200 } });
    await gameElement.click({ position: { x: 300, y: 300 } });
    
    // Game should still be responsive
    await expect(gameElement).toBeVisible();
  });

  test("should handle keyboard input", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Focus on game element
    await gameElement.focus();
    
    // Test arrow key movement
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    
    // Test other game keys
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    
    // Game should still be responsive
    await expect(gameElement).toBeVisible();
  });

  test("should handle mouse interactions", async ({ page }) => {
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Test mouse movement
    await gameElement.hover({ position: { x: 100, y: 100 } });
    await gameElement.hover({ position: { x: 200, y: 200 } });
    
    // Test right click
    await gameElement.click({ 
      position: { x: 150, y: 150 }, 
      button: "right" 
    });
    
    // Test middle click
    await gameElement.click({ 
      position: { x: 250, y: 250 }, 
      button: "middle" 
    });
    
    // Game should still be responsive
    await expect(gameElement).toBeVisible();
  });
});
