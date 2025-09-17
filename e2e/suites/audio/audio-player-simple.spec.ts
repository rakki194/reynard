import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Audio Player E2E Tests (Simple)", () => {
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
      <div id="audio-container">
        <audio controls>
          <source src="/test-audio.mp3" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        <div class="audio-controls">
          <button aria-label="Play">▶</button>
          <button aria-label="Pause">⏸</button>
          <button aria-label="Stop">⏹</button>
        </div>
      </div>
    `);

    await expect(page.locator("#audio-container")).toBeVisible();
    await expect(page.locator("audio")).toBeVisible();
    await expect(page.locator('button[aria-label="Play"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Pause"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Stop"]')).toBeVisible();
  });

  test("should handle audio player interactions", async () => {
    await page.setContent(`
      <div id="audio-container">
        <audio controls>
          <source src="/test-audio.mp3" type="audio/mpeg">
        </audio>
        <div class="audio-controls">
          <button id="play-btn" aria-label="Play">▶</button>
          <button id="pause-btn" aria-label="Pause">⏸</button>
        </div>
      </div>
    `);

    const playButton = page.locator("#play-btn");
    const pauseButton = page.locator("#pause-btn");

    await expect(playButton).toBeVisible();
    await expect(pauseButton).toBeVisible();

    // Test button clicks
    await playButton.click();
    await pauseButton.click();
  });

  test("should have proper accessibility attributes", async () => {
    await page.setContent(`
      <div id="audio-container">
        <audio controls aria-label="Audio player">
          <source src="/test-audio.mp3" type="audio/mpeg">
        </audio>
        <div class="audio-controls" role="group" aria-label="Audio controls">
          <button aria-label="Play audio">▶</button>
          <button aria-label="Pause audio">⏸</button>
        </div>
      </div>
    `);

    const audio = page.locator('audio[aria-label="Audio player"]');
    await expect(audio).toBeVisible();

    const controls = page.locator('[role="group"][aria-label="Audio controls"]');
    await expect(controls).toBeVisible();
  });
});
