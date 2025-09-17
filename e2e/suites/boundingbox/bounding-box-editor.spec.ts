import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Bounding Box Editor E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render bounding box editor with image", async () => {
    await page.setContent(`
      <div id="bbox-container" style="width: 500px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { BoundingBoxEditor } from "/packages/boundingbox/src/components/BoundingBoxEditor.tsx";

        render(() => (
          <BoundingBoxEditor 
            imageSrc="/test-image.jpg"
            width={500}
            height={400}
          />
        ), document.getElementById("bbox-container"));
      </script>
    `);

    await expect(page.locator("#bbox-container")).toBeVisible();
    await expect(page.locator("#bbox-container canvas")).toBeVisible();
  });

  test("should handle bounding box creation", async () => {
    await page.setContent(`
      <div id="bbox-container" style="width: 500px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { BoundingBoxEditor } from "/packages/boundingbox/src/components/BoundingBoxEditor.tsx";

        render(() => (
          <BoundingBoxEditor 
            imageSrc="/test-image.jpg"
            width={500}
            height={400}
          />
        ), document.getElementById("bbox-container"));
      </script>
    `);

    const canvas = page.locator("#bbox-container canvas");
    await expect(canvas).toBeVisible();

    // Simulate mouse events for bounding box creation
    await canvas.hover();
    await canvas.click({ position: { x: 100, y: 100 } });
  });
});
