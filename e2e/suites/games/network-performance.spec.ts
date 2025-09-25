/**
 * Games Demo Network Performance E2E Tests
 *
 * Performance-focused tests for network requests and resource loading.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Games Demo Network Performance", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should load resources efficiently", async () => {
    const requests: string[] = [];

    // Track network requests
    page.on("request", request => {
      requests.push(request.url());
    });

    await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });

    // Should not have excessive requests
    expect(requests.length).toBeLessThan(50);

    // Check for large resources
    const largeRequests = requests.filter(
      url => url.includes(".js") || url.includes(".css") || url.includes(".png") || url.includes(".jpg")
    );

    // Should have reasonable number of resources
    expect(largeRequests.length).toBeLessThan(20);
  });

  test("should handle resource loading errors gracefully", async () => {
    // Block some resources to test error handling
    await page.route("**/*.png", route => route.abort());

    const startTime = Date.now();

    await page.goto(GAMES_DEMO_URL, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;

    // Should still load within reasonable time even with blocked resources
    expect(loadTime).toBeLessThan(5000);

    // Page should still be functional
    await expect(page.locator("h1")).toContainText("Reynard Games Demo");
  });
});
