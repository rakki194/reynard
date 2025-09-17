/**
 * Playwright Configuration for I18n Performance Benchmarking
 *
 * 🦦 *splashes with performance testing enthusiasm* Specialized configuration
 * for comprehensive i18n performance benchmarking across different approaches.
 */

import { defineConfig, devices } from "@playwright/test";
import { detectAuthAppPort, getAppBaseUrl } from "../core/config/port-detector";

export default defineConfig({
  testDir: "../suites",
  testMatch: ["i18n/*.spec.ts"],

  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for accurate benchmarking

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* No retries for benchmarking - we want consistent results */
  retries: 0,

  /* Single worker for consistent benchmarking */
  workers: 1,

  /* Enhanced reporting for performance metrics */
  reporter: [
    ["html", { outputFolder: "i18n-benchmark-results", open: "never" }],
    ["json", { outputFile: "i18n-benchmark-results.json" }],
    ["junit", { outputFile: "i18n-benchmark-results.xml" }],
    ["list"],
  ],

  /* Shared settings optimized for performance testing */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${detectAuthAppPort()}`,

    /* Enhanced tracing for performance analysis */
    trace: "on",

    /* Screenshots for debugging performance issues */
    screenshot: "only-on-failure",

    /* Video recording for performance analysis */
    video: "retain-on-failure",

    /* Extended timeouts for performance testing */
    actionTimeout: 30000,
    navigationTimeout: 60000,

    /* Performance monitoring context */
    contextOptions: {
      // Disable images and fonts for faster loading in some tests
      ignoreHTTPSErrors: true,
    },
  },

  /* Configure projects for performance testing across browsers */
  projects: [
    {
      name: "chromium-performance",
      use: {
        ...devices["Desktop Chrome"],
        // Performance-optimized settings
        launchOptions: {
          args: [
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-ipc-flooding-protection",
            "--enable-precise-memory-info",
            "--memory-pressure-off",
          ],
        },
      },
    },

    {
      name: "firefox-performance",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "dom.performance.enable_user_timing_logging": true,
            "dom.performance.enable_resource_timing": true,
          },
        },
      },
    },

    {
      name: "webkit-performance",
      use: {
        ...devices["Desktop Safari"],
        launchOptions: {
          args: ["--enable-precise-memory-info"],
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "cd backend && python main.py",
      url: "http://localhost:8000",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "cd ../examples/i18n-demo && pnpm run dev",
      url: getAppBaseUrl("i18n-demo"),
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "cd ../examples/basic-app && pnpm run dev",
      url: getAppBaseUrl("basic-app"),
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  /* Extended timeouts for performance testing */
  timeout: 60 * 1000, // 1 minute per test
  expect: {
    timeout: 30 * 1000, // 30 seconds for assertions
  },

  /* Output directory for benchmark results */
  outputDir: "../results/i18n-benchmark-results/",

  /* Global setup and teardown for performance testing */
  globalSetup: "../core/setup/global-i18n-setup.ts",
  globalTeardown: "../core/setup/global-i18n-teardown.ts",
});
