/**
 * 🦊 Reynard Queue Watcher Configuration Tests
 *
 * Tests for the queue watcher configuration system.
 */

import { describe, it, expect } from "vitest";
import { WATCH_DIRECTORIES, EXCLUDE_PATTERNS, DEFAULT_CONFIG } from "../config.js";

describe("Queue Watcher Configuration", () => {
  it("should have watchable directories", () => {
    expect(WATCH_DIRECTORIES).toBeInstanceOf(Array);
    expect(WATCH_DIRECTORIES.length).toBeGreaterThan(0);

    // Should include key directories (as relative paths from queue-watcher location)
    expect(WATCH_DIRECTORIES).toContain("../../../packages");
    expect(WATCH_DIRECTORIES).toContain("../../../backend");
    expect(WATCH_DIRECTORIES).toContain("../../../services");
    expect(WATCH_DIRECTORIES).toContain("../../../docs");
    expect(WATCH_DIRECTORIES).toContain("../../../examples");
    expect(WATCH_DIRECTORIES).toContain("../../../templates");
    expect(WATCH_DIRECTORIES).toContain("../../../e2e");
    expect(WATCH_DIRECTORIES).toContain("../../../scripts");
  });

  it("should have exclude patterns", () => {
    expect(EXCLUDE_PATTERNS).toBeInstanceOf(Array);
    expect(EXCLUDE_PATTERNS.length).toBeGreaterThan(0);

    // Should have common exclude patterns (test that patterns exist, not specific matching)
    expect(EXCLUDE_PATTERNS.every(pattern => pattern instanceof RegExp)).toBe(true);
  });

  it("should have default configuration", () => {
    expect(DEFAULT_CONFIG).toBeDefined();
    expect(DEFAULT_CONFIG.watchDirectories).toBe(WATCH_DIRECTORIES);
    expect(DEFAULT_CONFIG.excludePatterns).toBe(EXCLUDE_PATTERNS);
    expect(DEFAULT_CONFIG.processingCooldown).toBe(2000);
    expect(DEFAULT_CONFIG.statusReportInterval).toBe(10000);
  });

  it("should have consistent directory counts", () => {
    expect(WATCH_DIRECTORIES.length).toBeGreaterThan(50); // Based on current architecture
    expect(EXCLUDE_PATTERNS.length).toBeGreaterThan(10); // Based on current patterns

    // Check for unique directories (should be more than 50 unique directories)
    const uniqueDirectories = new Set(WATCH_DIRECTORIES);
    expect(uniqueDirectories.size).toBeGreaterThan(50);
  });

  it("should include cursor directories", () => {
    expect(WATCH_DIRECTORIES).toContain("../../../.cursor/docs");
    expect(WATCH_DIRECTORIES).toContain("../../../.cursor/prompts");
    expect(WATCH_DIRECTORIES).toContain("../../../.cursor/rules");
  });

  it("should include all important project directories", () => {
    const expectedDirs = [
      "../../../packages",
      "../../../backend",
      "../../../services",
      "../../../docs",
      "../../../.cursor/docs",
      "../../../.cursor/prompts",
      "../../../.cursor/rules",
      "../../../examples",
      "../../../templates",
      "../../../e2e",
      "../../../scripts",
      "../../../nginx",
      "../../../.cursor/todos",
      "../../../data",
      "../../../fenrir",
    ];

    for (const dir of expectedDirs) {
      expect(WATCH_DIRECTORIES).toContain(dir);
    }
  });

  it("should exclude third_party directory", () => {
    expect(WATCH_DIRECTORIES).not.toContain("third_party");
  });

  it("should have proper exclude pattern types", () => {
    for (const pattern of EXCLUDE_PATTERNS) {
      expect(pattern).toBeInstanceOf(RegExp);
    }
  });

  it("should have exclude patterns for common build artifacts", () => {
    // Test that we have patterns for common build artifacts (don't test specific matching)
    const patternStrings = EXCLUDE_PATTERNS.map(pattern => pattern.toString());

    expect(patternStrings.some(p => p.includes("node_modules"))).toBe(true);
    expect(patternStrings.some(p => p.includes("dist"))).toBe(true);
    expect(patternStrings.some(p => p.includes("build"))).toBe(true);
  });

  it("should not exclude source files", () => {
    const testPaths = [
      "packages/components/src/Button.tsx",
      "backend/app/main.py",
      "docs/README.md",
      "examples/dashboard/src/App.tsx",
    ];

    for (const path of testPaths) {
      const shouldExclude = EXCLUDE_PATTERNS.some(pattern => pattern.test(path));
      expect(shouldExclude).toBe(false);
    }
  });
});
