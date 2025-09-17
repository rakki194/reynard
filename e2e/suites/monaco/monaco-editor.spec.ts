import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Monaco Editor E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render Monaco editor with code", async () => {
    await page.setContent(`
      <div id="monaco-container" style="width: 600px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { MonacoEditor } from "/packages/monaco/src/components/MonacoEditor.tsx";

        const initialCode = "function hello() {\n  console.log('Hello World!');\n}";

        render(() => (
          <MonacoEditor 
            value={initialCode}
            language="javascript"
            width={600}
            height={400}
          />
        ), document.getElementById("monaco-container"));
      </script>
    `);
    
    await expect(page.locator("#monaco-container")).toBeVisible();
    // Monaco editor creates its own DOM structure
    await expect(page.locator("#monaco-container .monaco-editor")).toBeVisible();
  });

  test("should handle code editing", async () => {
    await page.setContent(`
      <div id="monaco-container" style="width: 600px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { MonacoEditor } from "/packages/monaco/src/components/MonacoEditor.tsx";

        render(() => (
          <MonacoEditor 
            value="console.log('test');"
            language="javascript"
            width={600}
            height={400}
          />
        ), document.getElementById("monaco-container"));
      </script>
    `);
    
    await expect(page.locator("#monaco-container")).toBeVisible();
    
    // Monaco editor should be interactive
    const editor = page.locator("#monaco-container .monaco-editor");
    await expect(editor).toBeVisible();
    
    // Click to focus the editor
    await editor.click();
  });
});
