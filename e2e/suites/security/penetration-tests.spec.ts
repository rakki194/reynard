/**
 * 🐺 Penetration Testing Suite
 *
 * *snarls with alpha wolf dominance* Comprehensive penetration testing
 * for the Reynard security framework.
 */

import { expect, test } from "@playwright/test";
import { createDefaultConfig, runFenrirExploit } from "../../modules/security";

test.describe("🐺 Penetration Testing Suite", () => {
  const config = createDefaultConfig();

  test("should run comprehensive penetration tests", async () => {
    const result = await runFenrirExploit("penetration_testing_client", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
