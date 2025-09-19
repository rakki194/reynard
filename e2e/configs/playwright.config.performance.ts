/**
 * 🦦 PERFORMANCE & TRACING PLAYWRIGHT CONFIGURATION
 *
 * *splashes with performance monitoring excitement* Comprehensive configuration
 * for performance testing, layout monitoring, and advanced tracing capabilities.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// 🦊 Initialize results manager for performance tests
const resultsManager = createResultsManager(TEST_TYPES.PERFORMANCE, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();
import { detectAuthAppPort } from "../core/config/port-detector";

export default defineConfig({
  testDir: "../suites",
  testMatch: ["performance/*.spec.ts", "layout/*.spec.ts", "tracing/*.spec.ts"],

  fullyParallel: false, // Sequential for accurate performance measurements
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for performance tests to maintain accuracy
  workers: 1, // Single worker for consistent performance measurements

  reporter: [
    ["html", { outputFolder: "performance-results", open: "never" }],
    ["json", { outputFile: "performance-results.json" }],
    ["junit", { outputFile: "performance-results.xml" }],
    ["line"], // Real-time progress
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${detectAuthAppPort()}`,

    // Enhanced tracing configuration
    trace: "on", // Always capture traces for performance analysis

    // Enhanced video recording
    video: "on", // Always record for performance analysis

    // Enhanced screenshot capture
    screenshot: "on", // Capture at every step for layout analysis

    // Performance-optimized timeouts
    actionTimeout: 30000,
    navigationTimeout: 60000,

    // Browser launch options for performance testing
    launchOptions: {
      args: [
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-features=TranslateUI",
        "--disable-ipc-flooding-protection",
        "--enable-precise-memory-info",
        "--enable-gpu-benchmarking",
        "--enable-threaded-compositing",
        "--enable-zero-copy",
        "--force-gpu-mem-available-mb=4096",
      ],
    },
  },

  projects: [
    {
      name: "performance-chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Additional performance monitoring
        launchOptions: {
          args: [
            "--enable-precise-memory-info",
            "--enable-gpu-benchmarking",
            "--enable-threaded-compositing",
            "--enable-zero-copy",
            "--force-gpu-mem-available-mb=4096",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
          ],
        },
      },
    },
    {
      name: "performance-firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "dom.performance.enable_user_timing_logging": true,
            "dom.performance.enable_resource_timing": true,
            "gfx.webrender.all": true,
            "gfx.webrender.enabled": true,
          },
        },
      },
    },
    {
      name: "performance-webkit",
      use: {
        ...devices["Desktop Safari"],
        launchOptions: {
          args: ["--enable-precise-memory-info", "--enable-gpu-benchmarking"],
        },
      },
    },
  ],

  timeout: 300 * 1000, // 5 minutes for performance tests
  expect: {
    timeout: 30 * 1000,
  },

  outputDir: "../results/performance-results/",

  // Global setup for performance testing
  globalSetup: "../core/setup/global-performance-setup.ts",
  globalTeardown: "../core/setup/global-performance-teardown.ts",

  // Web server configuration
  webServer: [
    {
      command: "cd backend && ./start.sh",
      url: "http://localhost:8000",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "cd ../examples/auth-app && E2E_BACKEND_URL=http://localhost:8000 pnpm run dev",
      url: `http://localhost:${detectAuthAppPort()}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
