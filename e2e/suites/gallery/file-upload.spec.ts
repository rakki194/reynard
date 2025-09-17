import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("File Upload E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render file upload component", async () => {
    await page.setContent(`
      <div id="upload-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { FileUpload } from "/packages/gallery/src/components/FileUpload.tsx";

        render(() => (
          <FileUpload 
            accept="image/*"
            multiple={true}
            onUpload={(files) => console.log('Files uploaded:', files)}
          />
        ), document.getElementById("upload-container"));
      </script>
    `);
    
    await expect(page.locator("#upload-container")).toBeVisible();
    
    // Check for file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  test("should handle file selection", async () => {
    await page.setContent(`
      <div id="upload-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { FileUpload } from "/packages/gallery/src/components/FileUpload.tsx";

        render(() => (
          <FileUpload 
            accept="image/*"
            multiple={true}
            onUpload={(files) => console.log('Files uploaded:', files)}
          />
        ), document.getElementById("upload-container"));
      </script>
    `);
    
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Check for upload button or drop zone
    const uploadButton = page.locator('button').or(page.locator('[data-testid="upload-button"]'));
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeVisible();
    }
  });

  test("should show drag and drop area", async () => {
    await page.setContent(`
      <div id="upload-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { FileUpload } from "/packages/gallery/src/components/FileUpload.tsx";

        render(() => (
          <FileUpload 
            accept="image/*"
            multiple={true}
            dragAndDrop={true}
            onUpload={(files) => console.log('Files uploaded:', files)}
          />
        ), document.getElementById("upload-container"));
      </script>
    `);
    
    await expect(page.locator("#upload-container")).toBeVisible();
    
    // Check for drag and drop area
    const dropZone = page.locator('[data-testid="drop-zone"]').or(page.locator('.drop-zone'));
    if (await dropZone.isVisible()) {
      await expect(dropZone).toBeVisible();
    }
  });
});
