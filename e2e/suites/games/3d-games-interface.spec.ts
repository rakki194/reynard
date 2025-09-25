/**
 * 3D Games Interface E2E Tests
 *
 * Tests for the 3D games interface components including
 * page loading, score system, theme toggle, and game info.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("3D Games Interface", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to 3D games
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should load 3D games page", async () => {
    // Check page title and header
    await expect(page.locator("h1")).toContainText("Reynard 3D Games");
    await expect(page.locator("p")).toContainText("Three.js");

    // Check for game selection interface
    await expect(page.locator(".game-selection")).toBeVisible();
  });

  test("should display score system", async () => {
    // Check score display
    const scoreDisplay = page.locator(".score-display");
    await expect(scoreDisplay).toBeVisible();
    await expect(scoreDisplay).toContainText("Score:");

    const scoreValue = scoreDisplay.locator(".score-value");
    await expect(scoreValue).toContainText("0");
  });

  test("should have theme toggle", async () => {
    // Check theme toggle exists
    const themeToggle = page.locator("button").filter({ hasText: /theme/i });
    await expect(themeToggle).toBeVisible();

    // Test theme toggle functionality
    await themeToggle.click();
    await expect(themeToggle).toBeEnabled();
  });

  test("should display game info", async () => {
    // Check for game info component
    const gameInfo = page.locator(".game-info, [data-testid='game-info']");
    await expect(gameInfo).toBeVisible();
  });
});
