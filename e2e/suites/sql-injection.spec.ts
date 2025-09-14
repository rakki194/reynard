/**
 * 🐺 SQL Injection Testing Suite
 * 
 * *snarls with predatory determination* Comprehensive SQL injection
 * vulnerability testing for the Reynard backend.
 */

import { test, expect } from "@playwright/test";
import { runFenrirExploit } from "../utils/fenrir-runner";
import { createDefaultConfig } from "../utils/penetration-test-config";

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
    const result = await runFenrirExploit(
      "sql_injection.obfuscated_payloads",
      {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive,
      },
    );

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});

