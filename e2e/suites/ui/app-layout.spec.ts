import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("App Layout E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render app layout with header and content", async () => {
    await page.setContent(`
      <div id="app-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { AppLayout } from "/packages/ui/src/layouts/AppLayout.tsx";

        render(() => (
          <AppLayout>
            <div slot="header">App Header</div>
            <div slot="content">Main Content</div>
          </AppLayout>
        ), document.getElementById("app-container"));
      </script>
    `);
    
    await expect(page.locator("#app-container")).toBeVisible();
    await expect(page.locator("#app-container")).toContainText("App Header");
    await expect(page.locator("#app-container")).toContainText("Main Content");
  });

  test("should handle responsive layout", async () => {
    await page.setContent(`
      <div id="app-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { AppLayout } from "/packages/ui/src/layouts/AppLayout.tsx";

        render(() => (
          <AppLayout responsive={true}>
            <div slot="header">Responsive Header</div>
            <div slot="content">Responsive Content</div>
          </AppLayout>
        ), document.getElementById("app-container"));
      </script>
    `);
    
    await expect(page.locator("#app-container")).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("#app-container")).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator("#app-container")).toBeVisible();
  });
});
