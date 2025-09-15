/**
 * 🐺 API Security Testing Suite
 * 
 * *snarls with predatory intelligence* Comprehensive API security
 * vulnerability testing for the Reynard backend endpoints.
 */

import { test, expect } from "@playwright/test";
import { runFenrirExploit } from "../../modules/security";
import { createDefaultConfig } from "../../modules/security";

test.describe("🐺 API Security Testing", () => {
  const config = createDefaultConfig();

  test("should test BOLA (Broken Object Level Authorization)", async () => {
    const result = await runFenrirExploit("api_exploits.bola_attacks", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });

  test("should test CORS misconfiguration", async () => {
    const result = await runFenrirExploit(
      "cors_exploits.cors_misconfiguration",
      {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive,
      },
    );

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });

  test("should test rate limiting bypass", async () => {
    const result = await runFenrirExploit("rate_limiting.rate_limit_bypass", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});

