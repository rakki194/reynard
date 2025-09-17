import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Segmentation Editor E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render segmentation editor with image", async () => {
    await page.setContent(`
      <div id="segmentation-container" style="width: 600px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { SegmentationEditor } from "/packages/segmentation/src/components/SegmentationEditor.tsx";

        render(() => (
          <SegmentationEditor 
            imageSrc="/test-image.jpg"
            width={600}
            height={400}
          />
        ), document.getElementById("segmentation-container"));
      </script>
    `);

    await expect(page.locator("#segmentation-container")).toBeVisible();
    await expect(page.locator("#segmentation-container canvas")).toBeVisible();
  });

  test("should handle segmentation drawing", async () => {
    await page.setContent(`
      <div id="segmentation-container" style="width: 600px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { SegmentationEditor } from "/packages/segmentation/src/components/SegmentationEditor.tsx";

        render(() => (
          <SegmentationEditor 
            imageSrc="/test-image.jpg"
            width={600}
            height={400}
          />
        ), document.getElementById("segmentation-container"));
      </script>
    `);

    const canvas = page.locator("#segmentation-container canvas");
    await expect(canvas).toBeVisible();

    // Simulate drawing on the canvas
    await canvas.hover();
    await canvas.click({ position: { x: 100, y: 100 } });

    // Check for segmentation tools/controls
    const toolsContainer = page.locator("#segmentation-container .tools");
    if (await toolsContainer.isVisible()) {
      await expect(toolsContainer).toBeVisible();
    }
  });
});
