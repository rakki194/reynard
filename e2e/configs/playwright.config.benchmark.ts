/**
 * Playwright Configuration for Component Rendering Benchmarks
 *
 * Specialized configuration for performance testing of Reynard components
 * across different rendering approaches and scenarios.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 *
 * 🦊 *whiskers twitch with unified precision* Now uses centralized results management.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// 🦊 Initialize results manager for benchmark tests
const resultsManager = createResultsManager(TEST_TYPES.BENCHMARK, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites/benchmark",
  testMatch: ["**/*.spec.ts"],

  /* Run tests in files in parallel */
  fullyParallel: false, // Disable for consistent benchmark results

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Single worker for consistent benchmark results */
  workers: 1,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: resultsManager.getReporterConfig(),

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Extended timeouts for benchmark tests */
    actionTimeout: 30000,
    navigationTimeout: 60000,

    /* Set consistent viewport */
    viewport: { width: 1920, height: 1080 },

    /* Disable service workers for consistent results */
    serviceWorkers: "block",
  },

  /* Configure projects for benchmark testing */
  projects: [
    {
      name: "benchmark-chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Disable hardware acceleration for consistent results
        launchOptions: {
          args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-ipc-flooding-protection",
            "--no-sandbox",
            "--disable-setuid-sandbox",
          ],
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "cd ../fixtures/benchmark-pages && python3 -m http.server 3000",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
  ],

  /* Extended timeouts for benchmark tests */
  timeout: 120 * 1000, // 2 minutes per test

  /* Global expect timeout */
  expect: {
    timeout: 30 * 1000,
  },

  /* Output directory for test artifacts */
  outputDir: resultsPaths.artifactsDir,

  /* Global setup and teardown */
  globalSetup: "../core/setup/benchmark-setup.ts",
  globalTeardown: "../core/setup/benchmark-teardown.ts",
});
