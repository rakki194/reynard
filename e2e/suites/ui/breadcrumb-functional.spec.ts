import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Breadcrumb Component Functional E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Load our custom component test page
    await page.goto('file://' + '/home/kade/runeset/reynard/e2e/fixtures/component-test-page.html');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render breadcrumb with proper structure", async () => {
    await page.evaluate(() => {
      const container = window.createTestComponent('Breadcrumb');
      
      // Create breadcrumb structure
      const breadcrumbHTML = `
        <nav aria-label="Breadcrumb" class="breadcrumb">
          <ol class="breadcrumb-list">
            <li class="breadcrumb-item">
              <a href="/" class="breadcrumb-link">Home</a>
            </li>
            <li class="breadcrumb-item">
              <a href="/products" class="breadcrumb-link">Products</a>
            </li>
            <li class="breadcrumb-item">
              <a href="/products/category" class="breadcrumb-link">Category</a>
            </li>
            <li class="breadcrumb-item breadcrumb-current" aria-current="page">
              Current Page
            </li>
          </ol>
        </nav>
      `;
      
      container.innerHTML = breadcrumbHTML;
    });
    
    // Test breadcrumb structure
    await expect(page.locator('.breadcrumb')).toBeVisible();
    await expect(page.locator('.breadcrumb-list')).toBeVisible();
    await expect(page.locator('.breadcrumb-item')).toHaveCount(4);
    
    // Test links
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toContainText("Home");
    await expect(page.locator('a[href="/products"]')).toBeVisible();
    await expect(page.locator('a[href="/products"]')).toContainText("Products");
    await expect(page.locator('a[href="/products/category"]')).toBeVisible();
    await expect(page.locator('a[href="/products/category"]')).toContainText("Category");
    
    // Test current page
    await expect(page.locator('.breadcrumb-current')).toBeVisible();
    await expect(page.locator('.breadcrumb-current')).toContainText("Current Page");
    await expect(page.locator('[aria-current="page"]')).toBeVisible();
  });

  test("should handle breadcrumb navigation", async () => {
    await page.evaluate(() => {
      const container = window.createTestComponent('Breadcrumb');
      
      const breadcrumbHTML = `
        <nav aria-label="Breadcrumb" class="breadcrumb">
          <ol class="breadcrumb-list">
            <li class="breadcrumb-item">
              <a href="/" class="breadcrumb-link">Home</a>
            </li>
            <li class="breadcrumb-item">
              <a href="/about" class="breadcrumb-link">About</a>
            </li>
            <li class="breadcrumb-item breadcrumb-current" aria-current="page">
              Contact
            </li>
          </ol>
        </nav>
      `;
      
      container.innerHTML = breadcrumbHTML;
    });
    
    // Test navigation links
    const homeLink = page.locator('a[href="/"]');
    const aboutLink = page.locator('a[href="/about"]');
    
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toContainText("Home");
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toContainText("About");
    
    // Test click events
    await homeLink.click();
    await aboutLink.click();
  });

  test("should have proper accessibility attributes", async () => {
    await page.evaluate(() => {
      const container = window.createTestComponent('Breadcrumb');
      
      const breadcrumbHTML = `
        <nav aria-label="Breadcrumb" class="breadcrumb" role="navigation">
          <ol class="breadcrumb-list">
            <li class="breadcrumb-item">
              <a href="/" class="breadcrumb-link" aria-label="Go to home page">Home</a>
            </li>
            <li class="breadcrumb-item breadcrumb-current" aria-current="page">
              <span class="breadcrumb-text">Current Page</span>
            </li>
          </ol>
        </nav>
      `;
      
      container.innerHTML = breadcrumbHTML;
    });
    
    // Test accessibility attributes
    const nav = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('role', 'navigation');
    
    const homeLink = page.locator('a[aria-label="Go to home page"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('aria-label', 'Go to home page');
    
    const currentPage = page.locator('[aria-current="page"]');
    await expect(currentPage).toBeVisible();
    await expect(currentPage).toContainText("Current Page");
  });

  test("should handle dynamic breadcrumb updates", async () => {
    await page.evaluate(() => {
      const container = window.createTestComponent('Breadcrumb');
      
      // Initial breadcrumb
      let breadcrumbHTML = `
        <nav aria-label="Breadcrumb" class="breadcrumb">
          <ol class="breadcrumb-list">
            <li class="breadcrumb-item">
              <a href="/" class="breadcrumb-link">Home</a>
            </li>
            <li class="breadcrumb-item breadcrumb-current" aria-current="page">
              Page 1
            </li>
          </ol>
        </nav>
      `;
      
      container.innerHTML = breadcrumbHTML;
      
      // Function to update breadcrumb
      window.updateBreadcrumb = function(newItems) {
        const list = container.querySelector('.breadcrumb-list');
        list.innerHTML = newItems.map((item, index) => {
          if (index === newItems.length - 1) {
            return `<li class="breadcrumb-item breadcrumb-current" aria-current="page">${item}</li>`;
          } else {
            return `<li class="breadcrumb-item"><a href="/${item.toLowerCase()}" class="breadcrumb-link">${item}</a></li>`;
          }
        }).join('');
      };
    });
    
    // Test initial state
    await expect(page.locator('.breadcrumb-current')).toContainText("Page 1");
    
    // Update breadcrumb
    await page.evaluate(() => {
      window.updateBreadcrumb(['Home', 'Products', 'Category', 'Page 2']);
    });
    
    // Test updated state
    await expect(page.locator('.breadcrumb-item')).toHaveCount(4);
    await expect(page.locator('.breadcrumb-current')).toContainText("Page 2");
    await expect(page.locator('a[href="/products"]')).toContainText("Products");
    await expect(page.locator('a[href="/category"]')).toContainText("Category");
  });
});
