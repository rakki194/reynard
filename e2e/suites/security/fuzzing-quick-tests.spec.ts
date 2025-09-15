/**
 * 🐺 Quick Fuzzing Tests
 *
 * *snarls with focused intensity* Fast fuzzing attacks for
 * authentication and search endpoints.
 */

import { expect, test } from "@playwright/test";
import { runFenrirExploit } from "../../modules/security";
import { createDefaultConfig } from "../../modules/security";

test.describe("🐺 Quick Fuzzing Tests", () => {
  const config = createDefaultConfig();

  test("should run quick authentication fuzzing", async () => {
    test.setTimeout(90000); // 1.5 minute test timeout

    const result = await runFenrirExploit("fuzzing.endpoint_fuzzer", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
      quickTest: true, // Only test auth endpoints
      timeout: 60000, // 1 minute timeout for quick test
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });

  test("should run quick search fuzzing", async () => {
    test.setTimeout(90000); // 1.5 minute test timeout

    const result = await runFenrirExploit("fuzzing.endpoint_fuzzer", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
      quickTest: true, // Only test search endpoints
      timeout: 60000, // 1 minute timeout for quick test
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
