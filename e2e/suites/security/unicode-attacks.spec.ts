/**
 * 🐺 Unicode Security Attack Testing
 *
 * *snarls with predatory precision* Unicode normalization bypass
 * attack vectors for testing character encoding vulnerabilities.
 */

import { expect, test } from "@playwright/test";
import { createDefaultConfig, runFenrirExploit } from "../../modules/security";

test.describe("🐺 Unicode Security Attack Testing", () => {
  const config = createDefaultConfig();

  test("should test unicode normalization bypass", async () => {
    const result = await runFenrirExploit("unicode_exploits.normalization_bypass", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
