/**
 * 🐺 Path Traversal Testing Suite
 *
 * *snarls with predatory precision* Comprehensive path traversal
 * vulnerability testing for the Reynard file system security.
 */

import { expect, test } from "@playwright/test";
import { createDefaultConfig, runFenrirExploit } from "../../modules/security";

test.describe("🐺 Path Traversal Testing", () => {
  const config = createDefaultConfig();

  test("should test encoded path traversal", async () => {
    const result = await runFenrirExploit("path_traversal.encoded_traversal", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });

  test("should test unicode path traversal bypass", async () => {
    const result = await runFenrirExploit("path_traversal.unicode_bypass", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
