import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Breadcrumb Component E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render breadcrumb with items", async () => {
    await page.setContent(`
      <div id="breadcrumb-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { Breadcrumb } from "/packages/ui/src/navigation/Breadcrumb.tsx";

        const items = [
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: "Category", href: "/products/category" },
          { label: "Current Page" }
        ];

        render(() => (
          <Breadcrumb items={items} />
        ), document.getElementById("breadcrumb-container"));
      </script>
    `);

    await expect(page.locator("#breadcrumb-container")).toBeVisible();
    await expect(page.locator("#breadcrumb-container")).toContainText("Home");
    await expect(page.locator("#breadcrumb-container")).toContainText("Products");
    await expect(page.locator("#breadcrumb-container")).toContainText("Category");
    await expect(page.locator("#breadcrumb-container")).toContainText("Current Page");
  });

  test("should handle breadcrumb navigation", async () => {
    await page.setContent(`
      <div id="breadcrumb-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { Breadcrumb } from "/packages/ui/src/navigation/Breadcrumb.tsx";

        const items = [
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: "Current Page" }
        ];

        render(() => (
          <Breadcrumb items={items} />
        ), document.getElementById("breadcrumb-container"));
      </script>
    `);

    // Check that links are clickable
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toContainText("Home");

    const productsLink = page.locator('a[href="/products"]');
    await expect(productsLink).toBeVisible();
    await expect(productsLink).toContainText("Products");
  });
});
