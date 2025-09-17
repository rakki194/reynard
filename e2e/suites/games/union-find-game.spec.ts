import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Union Find Game E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render union find game interface", async () => {
    await page.setContent(`
      <div id="game-container" style="width: 600px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { UnionFindGame } from "/packages/games/src/components/UnionFindGame.tsx";

        render(() => (
          <UnionFindGame />
        ), document.getElementById("game-container"));
      </script>
    `);

    await expect(page.locator("#game-container")).toBeVisible();
    await expect(page.locator("#game-container canvas")).toBeVisible();
  });

  test("should handle game interactions", async () => {
    await page.setContent(`
      <div id="game-container" style="width: 600px; height: 400px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { UnionFindGame } from "/packages/games/src/components/UnionFindGame.tsx";

        render(() => (
          <UnionFindGame />
        ), document.getElementById("game-container"));
      </script>
    `);

    const canvas = page.locator("#game-container canvas");
    await expect(canvas).toBeVisible();

    // Simulate game interactions
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 200, y: 200 } });
  });
});
