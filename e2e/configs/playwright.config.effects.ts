/**
 * EFFECTS TEST CONFIGURATION
 *
 * Playwright configuration specifically for testing SolidJS createEffect patterns and preventing Cloudflare-style outages.
 *
 * Now uses centralized results management.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// Initialize results manager for effects tests
const resultsManager = createResultsManager(TEST_TYPES.EFFECTS, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites/effects",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: resultsManager.getReporterConfig(),
  use: {
    baseURL: "http://localhost:12525",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium-effects",
      use: {
        ...devices["Desktop Chrome"],
        // Enhanced monitoring for effect tests
        launchOptions: {
          args: ["--enable-logging", "--log-level=0", "--enable-performance-monitoring", "--memory-pressure-off"],
        },
      },
    },
    {
      name: "firefox-effects",
      use: {
        ...devices["Desktop Firefox"],
        // Firefox-specific settings for effect monitoring
        launchOptions: {
          firefoxUserPrefs: {
            "dom.webnotifications.enabled": false,
            "dom.push.enabled": false,
            "media.navigator.permission.disabled": true,
          },
        },
      },
    },
    {
      name: "webkit-effects",
      use: {
        ...devices["Desktop Safari"],
        // WebKit-specific settings
        launchOptions: {
          args: ["--enable-logging"],
        },
      },
    },
  ],
  webServer: {
    command: "python3 -m http.server 12525 --directory fixtures",
    url: "http://localhost:12525",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  // Global setup for effect monitoring (disabled for now)
  // globalSetup: new URL('../core/setup/effects-global-setup.ts', import.meta.url).pathname,
  // globalTeardown: new URL('../core/setup/effects-global-teardown.ts', import.meta.url).pathname,
  // Test timeout for effect monitoring
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  /* Output directory for test artifacts */
  outputDir: resultsManager.getOutputDir(),
});
