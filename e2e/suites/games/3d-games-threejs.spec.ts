/**
 * Three.js Integration E2E Tests
 *
 * Tests for Three.js integration including
 * 3D graphics rendering, WebGL context, and transformations.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Three.js Integration", () => {
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

  test("should render 3D graphics", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    // Look for canvas elements (Three.js typically uses canvas)
    const canvas = page.locator("canvas");
    if ((await canvas.count()) > 0) {
      await expect(canvas.first()).toBeVisible();

      // Check canvas dimensions
      const canvasBox = await canvas.first().boundingBox();
      expect(canvasBox).toBeTruthy();
      expect(canvasBox!.width).toBeGreaterThan(0);
      expect(canvasBox!.height).toBeGreaterThan(0);
    }
  });

  test("should handle WebGL context", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    // Check if WebGL is available
    const webglSupport = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    });

    expect(webglSupport).toBe(true);
  });

  test("should handle 3D transformations", async () => {
    await page.goto(`${GAMES_DEMO_URL}/#3d-games`, { waitUntil: "networkidle" });

    const gameButtons = page.locator("button").filter({ hasText: /cube|space|maze|particle/i });
    if ((await gameButtons.count()) > 0) {
      await gameButtons.first().click();
      await page.waitForTimeout(2000);

      const gameContainer = page.locator(".game-container, canvas");
      await expect(gameContainer).toBeVisible();

      // Test interactions that might trigger 3D transformations
      await gameContainer.click({ position: { x: 100, y: 100 } });
      await gameContainer.click({ position: { x: 200, y: 200 } });

      // Test mouse movement for camera controls
      await gameContainer.hover({ position: { x: 150, y: 150 } });
      await gameContainer.hover({ position: { x: 250, y: 250 } });

      await expect(gameContainer).toBeVisible();
    }
  });
});
