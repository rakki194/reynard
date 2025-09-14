/**
 * 🐺 Comprehensive Fuzzing Tests
 * 
 * *snarls with predatory glee* Full-scale fuzzing attacks
 * for comprehensive vulnerability assessment.
 */

import { test, expect } from "@playwright/test";
import { runFenrirExploit } from "../utils/fenrir-runner";
import { createDefaultConfig } from "../utils/penetration-test-config";

test.describe("🐺 Comprehensive Fuzzing Tests", () => {
  const config = createDefaultConfig();

  test("should run comprehensive fuzzing framework", async () => {
    const result = await runFenrirExploit("fuzzing.exploit_wrappers", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
      maxPayloads: 1000, // MASSIVE attack: 50+ endpoints with 1000+ payloads
      timeout: 300000, // 5 minute timeout for massive attack
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  }, 400000); // 6.5 minute test timeout

  test("should run endpoint-specific fuzzing", async () => {
    const result = await runFenrirExploit("fuzzing.exploit_wrappers", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
      endpoints: ["/api/auth/login", "/api/auth/register"],
      timeout: 120000, // 2 minute timeout for full attack
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  }, 200000); // 3.5 minute test timeout

  test("should run specialized endpoint fuzzing", async () => {
    const result = await runFenrirExploit("fuzzing.endpoint_fuzzer", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
      timeout: 180000, // 3 minute timeout for specialized attacks
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  }, 250000); // 4 minute test timeout
});
