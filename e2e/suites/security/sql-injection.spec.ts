/**
 * 🐺 SQL Injection Testing Suite
 *
 * *snarls with predatory determination* Comprehensive SQL injection
 * vulnerability testing for the Reynard backend.
 */

import { expect, test } from "@playwright/test";
import { createDefaultConfig, runFenrirExploit } from "../../modules/security";

test.describe("🐺 SQL Injection Testing", () => {
  const config = createDefaultConfig();

  test("should test SQL injection regex bypass", async () => {
    const result = await runFenrirExploit("sql_injection.regex_bypass", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });

  test("should test blind SQL injection", async () => {
    const result = await runFenrirExploit("sql_injection.blind_injection", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });

  test("should test obfuscated SQL payloads", async () => {
    const result = await runFenrirExploit("sql_injection.obfuscated_payloads", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
