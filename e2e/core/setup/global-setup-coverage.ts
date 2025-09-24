/**
 * Global Setup for E2E Tests with Code Coverage
 * 
 * Initializes code coverage collection and sets up the test environment
 * for comprehensive coverage reporting with Vitest integration.
 */

import { FullConfig } from "@playwright/test";
import { promises as fs } from "fs";
import { join } from "path";

async function globalSetup(config: FullConfig) {
  console.log("🦊 Starting E2E test setup with code coverage...");

  // Create coverage directories
  const coverageDir = join(process.cwd(), "coverage", "e2e");
  const coverageRawDir = join(coverageDir, "raw");
  const coverageReportsDir = join(coverageDir, "reports");

  await fs.mkdir(coverageDir, { recursive: true });
  await fs.mkdir(coverageRawDir, { recursive: true });
  await fs.mkdir(coverageReportsDir, { recursive: true });

  // Initialize coverage collection state
  const coverageState = {
    startTime: Date.now(),
    testCount: 0,
    coverageFiles: [],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      ci: !!process.env.CI,
    },
  };

  await fs.writeFile(
    join(coverageDir, "coverage-state.json"),
    JSON.stringify(coverageState, null, 2)
  );

  // Set up environment variables for coverage
  process.env.E2E_COVERAGE_ENABLED = "true";
  process.env.E2E_COVERAGE_DIR = coverageDir;
  process.env.E2E_COVERAGE_RAW_DIR = coverageRawDir;
  process.env.E2E_COVERAGE_REPORTS_DIR = coverageReportsDir;

  // Initialize Vitest coverage integration
  await initializeVitestIntegration(coverageDir);

  console.log("✅ E2E coverage setup completed");
  console.log(`📁 Coverage directory: ${coverageDir}`);
}

/**
 * Initialize integration with Vitest coverage system
 */
async function initializeVitestIntegration(coverageDir: string): Promise<void> {
  const vitestCoverageConfig = {
    provider: "v8",
    enabled: true,
    reportsDirectory: join(coverageDir, "vitest"),
    reporter: ["text", "html", "lcov", "json"],
    include: [
      "packages/*/src/**/*.ts",
      "packages/*/src/**/*.tsx",
      "examples/*/src/**/*.ts",
      "examples/*/src/**/*.tsx",
    ],
    exclude: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "**/*.d.ts",
      "**/*.config.*",
      "**/test-setup.ts",
      "**/__tests__/**",
      "**/tests/**",
      "**/fixtures/**",
      "**/mocks/**",
    ],
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  };

  await fs.writeFile(
    join(coverageDir, "vitest-integration.json"),
    JSON.stringify(vitestCoverageConfig, null, 2)
  );
}

export default globalSetup;
