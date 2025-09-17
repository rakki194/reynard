import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Gallery E2E Tests", () => {
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
      <div id="gallery-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { Gallery } from "/packages/gallery/src/components/Gallery.tsx";

        const images = [
          { src: "/image1.jpg", alt: "Image 1" },
          { src: "/image2.jpg", alt: "Image 2" }
        ];

        render(() => (
          <Gallery images={images} />
        ), document.getElementById("gallery-container"));
      </script>
    `);
    
    await expect(page.locator("#gallery-container")).toBeVisible();
    await expect(page.locator("img[alt='Image 1']")).toBeVisible();
    await expect(page.locator("img[alt='Image 2']")).toBeVisible();
  });
});
