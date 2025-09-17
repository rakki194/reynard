import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Monaco Diff Editor E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render Monaco diff editor", async () => {
    await page.setContent(`
      <div id="monaco-diff-container" style="width: 800px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { MonacoDiffEditor } from "/packages/monaco/src/components/MonacoDiffEditor.tsx";

        const originalCode = "function hello() {\n  console.log('Hello');\n}";
        const modifiedCode = "function hello() {\n  console.log('Hello World!');\n}";

        render(() => (
          <MonacoDiffEditor 
            original={originalCode}
            modified={modifiedCode}
            language="javascript"
            width={800}
            height={400}
          />
        ), document.getElementById("monaco-diff-container"));
      </script>
    `);

    await expect(page.locator("#monaco-diff-container")).toBeVisible();
    // Monaco diff editor creates its own DOM structure
    await expect(page.locator("#monaco-diff-container .monaco-diff-editor")).toBeVisible();
  });

  test("should show differences between code versions", async () => {
    await page.setContent(`
      <div id="monaco-diff-container" style="width: 800px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { MonacoDiffEditor } from "/packages/monaco/src/components/MonacoDiffEditor.tsx";

        const originalCode = "const x = 1;";
        const modifiedCode = "const x = 2;";

        render(() => (
          <MonacoDiffEditor 
            original={originalCode}
            modified={modifiedCode}
            language="javascript"
            width={800}
            height={400}
          />
        ), document.getElementById("monaco-diff-container"));
      </script>
    `);

    await expect(page.locator("#monaco-diff-container")).toBeVisible();

    // Diff editor should show both versions
    const diffEditor = page.locator("#monaco-diff-container .monaco-diff-editor");
    await expect(diffEditor).toBeVisible();
  });
});
