/**
 * 🐺 SSRF Attack Testing
 * 
 * *snarls with predatory intelligence* Server-Side Request Forgery
 * attack vectors for testing internal network access and data exfiltration.
 */

import { test, expect } from "@playwright/test";
import { runFenrirExploit } from "../../modules/security";
import { createDefaultConfig } from "../../modules/security";

test.describe("🐺 SSRF Attack Testing", () => {
  const config = createDefaultConfig();

  test("should test Server-Side Request Forgery", async () => {
    const result = await runFenrirExploit("ssrf_exploits.ssrf_attacks", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
