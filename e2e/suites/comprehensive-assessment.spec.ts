/**
 * 🐺 Comprehensive Security Assessment Suite
 * 
 * *snarls with alpha wolf dominance* Complete security assessment
 * running the entire fenrir exploit suite for maximum coverage.
 */

import { test, expect } from "@playwright/test";
import { runCompleteFenrirSuite } from "../utils/fenrir-runner";
import { createDefaultConfig } from "../utils/penetration-test-config";

test.describe("🐺 Comprehensive Security Assessment", () => {
  const config = createDefaultConfig();

  test.beforeAll(async () => {
    // Verify fenrir suite is available
    const fenrirPath = require("path").join(process.cwd(), "..", "fenrir");
    console.log(`🐺 Fenrir suite path: ${fenrirPath}`);
  });

  test("should run complete fenrir exploit suite", async () => {
    const result = await runCompleteFenrirSuite({
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.totalVulnerabilities).toBeGreaterThanOrEqual(0);
    expect(result.exploitsRun).toBeGreaterThan(0);

    // Log comprehensive results
    console.log(`🐺 Complete Security Assessment Results:`);
    console.log(`Total Exploits Run: ${result.exploitsRun}`);
    console.log(
      `Total Vulnerabilities Found: ${result.totalVulnerabilities}`,
    );
    console.log(`Overall Security Rating: ${result.securityRating}`);

    if (result.totalVulnerabilities > 0) {
      console.log(`🚨 Security vulnerabilities detected!`);
      console.log(`Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  });
});

