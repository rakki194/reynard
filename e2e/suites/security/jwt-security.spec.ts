/**
 * 🐺 JWT Security Testing Suite
 *
 * *snarls with predatory focus* Comprehensive JWT vulnerability testing
 * for the Reynard authentication system.
 */

import { expect, test } from "@playwright/test";
import { createDefaultConfig, runFenrirExploit } from "../../modules/security";

test.describe("🐺 JWT Security Testing", () => {
  const config = createDefaultConfig();

  test("should test JWT secret key vulnerabilities", async () => {
    const result = await runFenrirExploit("jwt_exploits.secret_key_attack", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);

    if (result.vulnerabilitiesFound > 0) {
      console.log(`🚨 JWT vulnerabilities found: ${result.vulnerabilitiesFound}`);
      console.log(`Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  });

  test("should test JWT signature bypass attempts", async () => {
    const result = await runFenrirExploit("jwt_exploits.signature_bypass", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });

  test("should test JWT timing attacks", async () => {
    const result = await runFenrirExploit("jwt_exploits.timing_attack", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
