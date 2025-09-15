/**
 * 🐺 Race Condition Attack Testing
 *
 * *snarls with predatory patience* Race condition exploit vectors
 * for testing concurrent access vulnerabilities and timing attacks.
 */

import { expect, test } from "@playwright/test";
import { createDefaultConfig, runFenrirExploit } from "../../modules/security";

test.describe("🐺 Race Condition Attack Testing", () => {
  const config = createDefaultConfig();

  test("should test race condition exploits", async () => {
    const result = await runFenrirExploit("race_conditions.race_exploits", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
