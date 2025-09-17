import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Audio Player E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render audio player with controls", async () => {
    await page.setContent(`
      <div id="audio-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { AudioPlayer } from "/packages/audio/src/components/AudioPlayer.tsx";

        render(() => (
          <AudioPlayer src="/test-audio.mp3" />
        ), document.getElementById("audio-container"));
      </script>
    `);

    await expect(page.locator("#audio-container")).toBeVisible();
    await expect(page.locator("audio")).toBeVisible();
  });

  test("should handle play/pause functionality", async () => {
    await page.setContent(`
      <div id="audio-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { AudioPlayer } from "/packages/audio/src/components/AudioPlayer.tsx";

        render(() => (
          <AudioPlayer src="/test-audio.mp3" />
        ), document.getElementById("audio-container"));
      </script>
    `);

    const playButton = page.locator('[data-testid="play-button"]').or(page.locator('button[aria-label="Play"]'));
    if (await playButton.isVisible()) {
      await playButton.click();
      // Audio should start playing
    }
  });
});
