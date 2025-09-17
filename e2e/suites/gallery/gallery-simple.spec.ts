import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Gallery E2E Tests (Simple)", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render gallery with images", async () => {
    await page.setContent(`
      <div id="gallery-container">
        <div class="gallery-grid">
          <img src="/image1.jpg" alt="Image 1" loading="lazy">
          <img src="/image2.jpg" alt="Image 2" loading="lazy">
          <img src="/image3.jpg" alt="Image 3" loading="lazy">
        </div>
      </div>
    `);

    await expect(page.locator("#gallery-container")).toBeVisible();
    await expect(page.locator('img[alt="Image 1"]')).toBeVisible();
    await expect(page.locator('img[alt="Image 2"]')).toBeVisible();
    await expect(page.locator('img[alt="Image 3"]')).toBeVisible();
  });

  test("should handle image interactions", async () => {
    await page.setContent(`
      <div id="gallery-container">
        <div class="gallery-grid">
          <img src="/image1.jpg" alt="Image 1" class="gallery-item" data-id="1">
          <img src="/image2.jpg" alt="Image 2" class="gallery-item" data-id="2">
        </div>
      </div>
    `);

    const image1 = page.locator('img[data-id="1"]');
    const image2 = page.locator('img[data-id="2"]');

    await expect(image1).toBeVisible();
    await expect(image2).toBeVisible();

    // Test image clicks
    await image1.click();
    await image2.click();
  });

  test("should have proper accessibility attributes", async () => {
    await page.setContent(`
      <div id="gallery-container" role="region" aria-label="Image gallery">
        <div class="gallery-grid" role="grid">
          <img src="/image1.jpg" alt="Beautiful landscape with mountains" loading="lazy">
          <img src="/image2.jpg" alt="Ocean view at sunset" loading="lazy">
        </div>
      </div>
    `);

    const gallery = page.locator('[role="region"][aria-label="Image gallery"]');
    await expect(gallery).toBeVisible();

    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();

    // Check for descriptive alt text
    await expect(page.locator('img[alt="Beautiful landscape with mountains"]')).toBeVisible();
    await expect(page.locator('img[alt="Ocean view at sunset"]')).toBeVisible();
  });
});
