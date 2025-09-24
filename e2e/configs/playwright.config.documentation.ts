/**
 * Playwright Configuration for Documentation Validation Tests
 *
 * Specialized configuration for testing documentation code examples
 * with extended timeouts and isolated test environments.
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../suites/documentation",
  fullyParallel: false, // Run tests sequentially to avoid resource conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid conflicts with temp directories
  reporter: [
    ["html", { outputFolder: "../results/documentation-validation-results/" }],
    ["json", { outputFile: "../results/documentation-validation-results/results.json" }],
    ["junit", { outputFile: "../results/documentation-validation-results/results.xml" }],
  ],
  use: {
    headless: true, // Run in headless mode to avoid empty browser windows
    trace: "on",
    screenshot: "on",
    video: "on",
  },
  timeout: 300000, // 5 minutes per test (documentation validation can be slow)
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  projects: [
    {
      name: "documentation-validation",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/documentation-validation.spec.ts",
    },
  ],
  // webServer: {
  //   command: "echo 'Documentation validation tests do not require a web server'",
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
