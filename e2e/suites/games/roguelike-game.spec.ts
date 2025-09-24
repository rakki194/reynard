/**
 * Rogue-like Game E2E Tests
 * 
 * Main test suite that imports and runs all rogue-like game tests.
 * Individual test suites are split into separate files for better organization.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { setupPage, cleanupPage, getGameElement } from "./roguelike-test-utils";

test.describe("Rogue-like Game Main Tests", () => {
  test.beforeEach(async ({ browser }) => {
    await setupPage(browser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupPage(page);
  });

  test("should load rogue-like game successfully", async ({ page }) => {
    // Check page title and header
    await expect(page.locator("h1")).toContainText("Reynard Rogue-like");
    await expect(page.locator(".page-description")).toContainText("ECS system");
    
    // Check game container exists
    const gameContainer = page.locator(".game-container");
    await expect(gameContainer).toBeVisible();
    
    // Check for game element
    const gameElement = getGameElement(page);
    await expect(gameElement).toBeVisible();
    
    // Check game dimensions
    const gameBox = await gameElement.boundingBox();
    expect(gameBox).toBeTruthy();
    expect(gameBox!.width).toBeGreaterThan(0);
    expect(gameBox!.height).toBeGreaterThan(0);
  });

  test("should display technical features", async ({ page }) => {
    // Check tech stack section
    await expect(page.locator(".tech-stack h3")).toContainText("🛠️ Technical Features");
    
    // Check all feature cards are present
    const featureCards = page.locator(".feature-card");
    await expect(featureCards).toHaveCount(6);
    
    // Verify specific features
    const features = [
      "ECS Architecture",
      "Procedural Generation", 
      "AI Systems",
      "Pixel Art Rendering",
      "Line of Sight",
      "Combat & Items"
    ];
    
    for (const feature of features) {
      await expect(page.locator(".feature-card").filter({ hasText: feature })).toBeVisible();
    }
  });
});
