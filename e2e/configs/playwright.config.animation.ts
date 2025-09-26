/**
 * 🎭 Animation E2E Test Configuration
 *
 * Playwright configuration for animation-specific tests
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// Initialize results manager for animation tests
const resultsManager = createResultsManager(TEST_TYPES.COMPONENTS, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites/animation",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: resultsManager.getReporterConfig(),
  use: {
    baseURL: "http://localhost:3005",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Animation tests need more time for visual verification
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Enable hardware acceleration for better animation performance
        launchOptions: {
          args: [
            "--enable-gpu",
            "--enable-gpu-rasterization",
            "--enable-zero-copy",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
          ],
        },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // Firefox-specific settings for animations
        launchOptions: {
          firefoxUserPrefs: {
            "layers.acceleration.force-enabled": true,
            "gfx.webrender.all": true,
            "gfx.webrender.enabled": true,
          },
        },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        // WebKit-specific settings
        launchOptions: {
          args: ["--enable-gpu"],
        },
      },
    },
    // Mobile testing for touch interactions
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "cd ../../examples/animation-demo && pnpm dev",
    url: "http://localhost:3005",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server startup
  },
  // Animation-specific test settings
  expect: {
    // Allow for slight timing differences in animations
    timeout: 5000,
    // Visual comparison settings
    toHaveScreenshot: {
      threshold: 0.2,
      animations: "disabled", // Disable Playwright's animation waiting for our custom tests
    },
  },
  // Output directory for test artifacts
  outputDir: resultsPaths.artifactsDir,

  // Global setup for animation tests (disabled for debugging)
  // globalSetup: '../core/setup/animation-global-setup.ts',
  // globalTeardown: '../core/setup/animation-global-teardown.ts',
});
