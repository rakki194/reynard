/**
 * 🦊 Tests for Index Module
 *
 * Test the main module exports and functionality.
 */

import { describe, it, expect } from "vitest";

describe("Index Module", () => {
  it("should export IncrementalLintingService", async () => {
    const { IncrementalLintingService } = await import("../index.js");
    expect(IncrementalLintingService).toBeDefined();
    expect(typeof IncrementalLintingService).toBe("function");
  });

  it("should export LintingQueueManager", async () => {
    const { LintingQueueManager } = await import("../index.js");
    expect(LintingQueueManager).toBeDefined();
    expect(typeof LintingQueueManager).toBe("function");
  });

  it("should export LintingProcessors", async () => {
    const { LintingProcessors } = await import("../index.js");
    expect(LintingProcessors).toBeDefined();
    expect(typeof LintingProcessors).toBe("function");
  });

  it("should export configuration utilities", async () => {
    const { createDefaultConfig, loadConfig, saveConfig } = await import("../index.js");
    expect(createDefaultConfig).toBeDefined();
    expect(loadConfig).toBeDefined();
    expect(saveConfig).toBeDefined();
    expect(typeof createDefaultConfig).toBe("function");
    expect(typeof loadConfig).toBe("function");
    expect(typeof saveConfig).toBe("function");
  });

  it("should export all types", async () => {
    const indexModule = await import("../index.js");

    // Check that type exports are available (they won't be at runtime, but the module should load)
    expect(indexModule).toBeDefined();
  });

  it("should have IncrementalLintingService as default export", async () => {
    const defaultExport = await import("../index.js");
    expect(defaultExport.default).toBeDefined();
    expect(typeof defaultExport.default).toBe("function");
  });

  it("should create a default config when imported", async () => {
    const { createDefaultConfig } = await import("../index.js");
    const config = createDefaultConfig("/test");

    expect(config).toBeDefined();
    expect(config.rootPath).toBe("/test");
    expect(config.linters).toBeDefined();
    expect(Array.isArray(config.linters)).toBe(true);
  });
});
