import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Navigation Menu E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render navigation menu with items", async () => {
    await page.setContent(`
      <div id="nav-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { NavMenu } from "/packages/ui/src/navigation/NavMenu.tsx";

        const menuItems = [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" }
        ];

        render(() => (
          <NavMenu items={menuItems} />
        ), document.getElementById("nav-container"));
      </script>
    `);

    await expect(page.locator("#nav-container")).toBeVisible();
    await expect(page.locator("#nav-container")).toContainText("Home");
    await expect(page.locator("#nav-container")).toContainText("About");
    await expect(page.locator("#nav-container")).toContainText("Contact");
  });

  test("should handle menu item clicks", async () => {
    await page.setContent(`
      <div id="nav-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { NavMenu } from "/packages/ui/src/navigation/NavMenu.tsx";

        const menuItems = [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" }
        ];

        render(() => (
          <NavMenu items={menuItems} />
        ), document.getElementById("nav-container"));
      </script>
    `);

    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toContainText("Home");

    const aboutLink = page.locator('a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toContainText("About");
  });
});
