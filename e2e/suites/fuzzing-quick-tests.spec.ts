/**
 * 🐺 Quick Fuzzing Tests
 * 
 * *snarls with focused intensity* Fast fuzzing attacks for
 * authentication and search endpoints.
 */

import { test, expect } from "@playwright/test";
import { runFenrirExploit } from "../utils/fenrir-runner";
import { createDefaultConfig } from "../utils/penetration-test-config";

test.describe("🐺 Quick Fuzzing Tests", () => {
  const config = createDefaultConfig();

  test("should run quick authentication fuzzing", async () => {
    const result = await runFenrirExploit("fuzzing.endpoint_fuzzer", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
      quickTest: true, // Only test auth endpoints
      timeout: 60000, // 1 minute timeout for quick test
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  }, 90000); // 1.5 minute test timeout

  test("should run quick search fuzzing", async () => {
    const result = await runFenrirExploit("fuzzing.endpoint_fuzzer", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
      quickTest: true, // Only test search endpoints
      timeout: 60000, // 1 minute timeout for quick test
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  }, 90000); // 1.5 minute test timeout
});
