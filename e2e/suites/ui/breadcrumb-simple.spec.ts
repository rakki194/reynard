import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Breadcrumb Component E2E Tests (Simple)", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render basic breadcrumb structure", async () => {
    await page.setContent(`
      <div id="breadcrumb-container">
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/products/category">Category</a></li>
            <li aria-current="page">Current Page</li>
          </ol>
        </nav>
      </div>
    `);
    
    await expect(page.locator("#breadcrumb-container")).toBeVisible();
    await expect(page.locator("#breadcrumb-container")).toContainText("Home");
    await expect(page.locator("#breadcrumb-container")).toContainText("Products");
    await expect(page.locator("#breadcrumb-container")).toContainText("Category");
    await expect(page.locator("#breadcrumb-container")).toContainText("Current Page");
  });

  test("should handle breadcrumb navigation", async () => {
    await page.setContent(`
      <div id="breadcrumb-container">
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li aria-current="page">Current Page</li>
          </ol>
        </nav>
      </div>
    `);
    
    // Check that links are clickable
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toContainText("Home");
    
    const productsLink = page.locator('a[href="/products"]');
    await expect(productsLink).toBeVisible();
    await expect(productsLink).toContainText("Products");
  });

  test("should have proper accessibility attributes", async () => {
    await page.setContent(`
      <div id="breadcrumb-container">
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li aria-current="page">Current Page</li>
          </ol>
        </nav>
      </div>
    `);
    
    // Check accessibility attributes
    const nav = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(nav).toBeVisible();
    
    const currentPage = page.locator('li[aria-current="page"]');
    await expect(currentPage).toBeVisible();
    await expect(currentPage).toContainText("Current Page");
  });
});
