/**
 * 🐺 HTTP Request Smuggling Attack Testing
 *
 * *snarls with predatory cunning* HTTP request smuggling attack
 * vectors for testing protocol-level vulnerabilities and request parsing.
 */

import { expect, test } from "@playwright/test";
import { createDefaultConfig, runFenrirExploit } from "../../modules/security";

test.describe("🐺 HTTP Request Smuggling Attack Testing", () => {
  const config = createDefaultConfig();

  test("should test HTTP request smuggling", async () => {
    const result = await runFenrirExploit("http_smuggling.request_smuggling", {
      target: config.backendUrl,
      verbose: config.verbose,
      destructive: config.destructive,
    });

    expect(result.success).toBeDefined();
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
  });
});
