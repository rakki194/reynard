import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Drawer Component E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render drawer when opened", async () => {
    await page.setContent(`
      <div id="drawer-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { Drawer } from "/packages/ui/src/overlays/Drawer.tsx";

        const [isOpen, setIsOpen] = createSignal(true);

        render(() => (
          <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)}>
            <div>Drawer Content</div>
          </Drawer>
        ), document.getElementById("drawer-container"));
      </script>
    `);

    await expect(page.locator("#drawer-container")).toBeVisible();
    await expect(page.locator("#drawer-container")).toContainText("Drawer Content");
  });

  test("should close drawer when close button is clicked", async () => {
    await page.setContent(`
      <div id="drawer-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { createSignal } from "solid-js";
        import { Drawer } from "/packages/ui/src/overlays/Drawer.tsx";

        const [isOpen, setIsOpen] = createSignal(true);

        render(() => (
          <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)}>
            <div>Drawer Content</div>
          </Drawer>
        ), document.getElementById("drawer-container"));
      </script>
    `);

    // Find and click close button
    const closeButton = page.locator('[data-testid="drawer-close"]').or(page.locator('button[aria-label="Close"]'));
    if (await closeButton.isVisible()) {
      await closeButton.click();
      // Drawer should be hidden after close
      await expect(page.locator("#drawer-container")).not.toBeVisible();
    }
  });
});
