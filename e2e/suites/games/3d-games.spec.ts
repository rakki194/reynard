/**
 * 3D Games E2E Tests - Main Test Suite
 * 
 * Main test suite that imports and runs all 3D games test modules.
 * This file serves as the entry point for all 3D games E2E tests.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

// Import individual test modules
import "./3d-games-interface.spec";
import "./3d-games-selection.spec";
import "./3d-games-cube-collector.spec";
import "./3d-games-space-shooter.spec";
import "./3d-games-maze-explorer.spec";
import "./3d-games-particle-demo.spec";
import "./3d-games-navigation.spec";
import "./3d-games-threejs.spec";
import "./3d-games-performance.spec";
import "./3d-games-error-handling.spec";

test.describe("3D Games E2E Tests - Main Suite", () => {
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

  // Basic smoke test to ensure the main test suite loads
  test("should load 3D games page successfully", async () => {
    // Check page title and header
    await expect(page.locator("h1")).toContainText("Reynard 3D Games");
    await expect(page.locator("p")).toContainText("Three.js");
    
    // Check for game selection interface
    await expect(page.locator(".game-selection")).toBeVisible();
  });
});
