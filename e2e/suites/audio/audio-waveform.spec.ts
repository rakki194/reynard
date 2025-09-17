import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Audio Waveform Visualizer E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render audio waveform visualizer", async () => {
    await page.setContent(`
      <div id="waveform-container" style="width: 600px; height: 200px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { AudioWaveformVisualizer } from "/packages/audio/src/components/AudioWaveformVisualizer.tsx";

        const audioData = new Float32Array([0.1, 0.3, 0.5, 0.2, 0.8, 0.4]);

        render(() => (
          <AudioWaveformVisualizer 
            audioData={audioData}
            width={600}
            height={200}
          />
        ), document.getElementById("waveform-container"));
      </script>
    `);

    await expect(page.locator("#waveform-container")).toBeVisible();
    await expect(page.locator("#waveform-container canvas")).toBeVisible();
  });

  test("should handle waveform interactions", async () => {
    await page.setContent(`
      <div id="waveform-container" style="width: 600px; height: 200px;"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { AudioWaveformVisualizer } from "/packages/audio/src/components/AudioWaveformVisualizer.tsx";

        const audioData = new Float32Array([0.1, 0.3, 0.5, 0.2, 0.8, 0.4]);

        render(() => (
          <AudioWaveformVisualizer 
            audioData={audioData}
            width={600}
            height={200}
            interactive={true}
          />
        ), document.getElementById("waveform-container"));
      </script>
    `);

    const canvas = page.locator("#waveform-container canvas");
    await expect(canvas).toBeVisible();

    // Simulate clicking on waveform
    await canvas.click({ position: { x: 300, y: 100 } });
  });
});
