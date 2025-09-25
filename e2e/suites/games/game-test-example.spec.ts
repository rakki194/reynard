/**
 * Game Test Example
 *
 * Example test file demonstrating how to use the game test configuration
 * utilities for consistent game testing across the test suite.
 *
 * 🦊 *whiskers twitch with gaming precision* Example of proper game test configuration usage.
 */

import { test, expect } from "@playwright/test";
import {
  GAME_TEST_CONFIG,
  getGameTestTimeout,
  getGameInitializationDelay,
  getGameInteractionDelay,
  isPerformanceMonitoringEnabled,
  getViewportConfig,
} from "./game-test-config";

test.describe("Game Test Configuration Example", () => {
  test("should demonstrate game test configuration usage", async ({ page }) => {
    // Navigate to the game
    await page.goto("/");

    // Wait for game initialization using configured delay
    await page.waitForTimeout(getGameInitializationDelay());

    // Example of using game-specific timeouts
    const loadTimeout = getGameTestTimeout("load");
    const interactionTimeout = getGameTestTimeout("interaction");

    // Example of checking performance monitoring
    if (isPerformanceMonitoringEnabled()) {
      console.log("Performance monitoring is enabled");
    }

    // Example of using viewport configurations
    const standardViewport = getViewportConfig("standard");
    const mobileViewport = getViewportConfig("mobile");

    // Example game interaction with configured delay
    await page.click('[data-testid="start-game"]');
    await page.waitForTimeout(getGameInteractionDelay());

    // Example of using game test constants
    expect(await page.locator('[data-testid="game-canvas"]')).toBeVisible();

    // Example performance check
    const startTime = Date.now();
    await page.click('[data-testid="game-action"]');
    const endTime = Date.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(GAME_TEST_CONFIG.maxRenderTime);
  });

  test("should handle game loading performance", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForSelector('[data-testid="game-loaded"]', {
      timeout: getGameTestTimeout("load"),
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(GAME_TEST_CONFIG.maxLoadTime);
  });
});
