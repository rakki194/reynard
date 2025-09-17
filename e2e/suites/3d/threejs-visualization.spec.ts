import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("ThreeJS Visualization E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render ThreeJS canvas", async () => {
    await page.setContent(`
      <div id="threejs-container" style="width: 400px; height: 300px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { ThreeJSVisualization } from "/packages/3d/src/components/ThreeJSVisualization.tsx";

        render(() => (
          <ThreeJSVisualization width={400} height={300} />
        ), document.getElementById("threejs-container"));
      </script>
    `);
    
    await expect(page.locator("#threejs-container")).toBeVisible();
    await expect(page.locator("#threejs-container canvas")).toBeVisible();
  });
});
