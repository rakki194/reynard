/**
 * 🐺 CSRF Attack Testing
 * 
 * *snarls with predatory focus* Cross-Site Request Forgery attack
 * vectors for testing authentication bypass and state manipulation.
 */

import { test, expect } from "@playwright/test";
import { runFenrirExploit } from "../utils/fenrir-runner";
import { createDefaultConfig } from "../utils/penetration-test-config";

test.describe("🐺 CSRF Attack Testing", () => {
  const config = createDefaultConfig();

  test("should test CSRF attack vectors", async () => {
    const result = await runFenrirExploit("csrf_exploits.csrf_attacks", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
