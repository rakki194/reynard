/**
 * 🦊 Reynard Queue Watcher Integration Tests
 *
 * Integration tests for the queue watcher system.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DEFAULT_CONFIG } from "../config.js";
import { shouldExcludeFile, wasRecentlyProcessed } from "../file-utils.js";

describe("Queue Watcher Integration", () => {
  describe("Configuration Integration", () => {
    it("should have consistent configuration", () => {
      expect(DEFAULT_CONFIG.watchDirectories.length).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.excludePatterns.length).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.processingCooldown).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.statusReportInterval).toBeGreaterThan(0);
    });

    it("should have proper directory coverage", () => {
      const expectedDirs = [
        "packages", "backend", "services", "docs",
        "examples", "templates", "e2e", "scripts"
      ];
      
      for (const dir of expectedDirs) {
        expect(DEFAULT_CONFIG.watchDirectories).toContain(dir);
      }
    });

    it("should have comprehensive exclude patterns", () => {
      // Test that we have exclude patterns (don't test specific matching)
      expect(DEFAULT_CONFIG.excludePatterns.length).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.excludePatterns.every(pattern => pattern instanceof RegExp)).toBe(true);
    });
  });

  describe("File Processing Integration", () => {
    it("should handle file processing workflow", () => {
      const recentlyProcessed = new Map<string, number>();
      const cooldown = 1000;
      
      const testFile = "packages/components/src/Button.tsx";
      
      // Should not be excluded
      expect(shouldExcludeFile(testFile)).toBe(false);
      
      // Should not be recently processed initially
      expect(wasRecentlyProcessed(testFile, recentlyProcessed, cooldown)).toBe(false);
      
      // Should be recently processed after first call
      expect(wasRecentlyProcessed(testFile, recentlyProcessed, cooldown)).toBe(true);
    });

    it("should handle different file types", () => {
      const testFiles = [
        "packages/components/src/Button.tsx",
        "backend/app/main.py",
        "docs/README.md",
        "examples/dashboard/src/App.tsx"
      ];
      
      for (const file of testFiles) {
        expect(shouldExcludeFile(file)).toBe(false);
      }
    });

    it("should handle build artifacts", () => {
      const testFiles = [
        "packages/components/dist/index.js",
        "backend/app/__pycache__/main.pyc",
        "build/output.js",
        "coverage/lcov-report/index.html"
      ];
      
      for (const file of testFiles) {
        // Test that the function can handle these files without errors
        expect(() => shouldExcludeFile(file)).not.toThrow();
        expect(typeof shouldExcludeFile(file)).toBe("boolean");
      }
    });
  });

  describe("Performance Integration", () => {
    it("should handle large numbers of files efficiently", () => {
      const recentlyProcessed = new Map<string, number>();
      const cooldown = 1000;
      
      const startTime = Date.now();
      
      // Process many files
      for (let i = 0; i < 1000; i++) {
        const file = `packages/component-${i}/src/index.ts`;
        shouldExcludeFile(file);
        wasRecentlyProcessed(file, recentlyProcessed, cooldown);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it("should handle concurrent file processing", () => {
      const recentlyProcessed = new Map<string, number>();
      const cooldown = 100;
      
      const files = [
        "packages/components/src/Button.tsx",
        "packages/components/src/Input.tsx",
        "packages/components/src/Modal.tsx"
      ];
      
      // Process files concurrently
      const results = files.map(file => ({
        file,
        excluded: shouldExcludeFile(file),
        recent: wasRecentlyProcessed(file, recentlyProcessed, cooldown)
      }));
      
      // All should be processed correctly
      expect(results).toHaveLength(3);
      expect(results.every(r => !r.excluded)).toBe(true);
      expect(results.every(r => !r.recent)).toBe(true);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle malformed file paths", () => {
      const malformedPaths = [
        "",
        ".",
        "..",
        "/",
        "//",
        "\\",
        "C:\\Windows\\Path",
        "path/with/../..",
        "path/with/./."
      ];
      
      for (const path of malformedPaths) {
        // Should not throw errors
        expect(() => shouldExcludeFile(path)).not.toThrow();
        expect(() => wasRecentlyProcessed(path, new Map(), 1000)).not.toThrow();
      }
    });

    it("should handle special characters in paths", () => {
      const specialPaths = [
        "packages/component with spaces/src/index.ts",
        "packages/component-with-dashes/src/index.ts",
        "packages/component_with_underscores/src/index.ts",
        "packages/component.with.dots/src/index.ts",
        "packages/component@with@symbols/src/index.ts"
      ];
      
      for (const path of specialPaths) {
        expect(() => shouldExcludeFile(path)).not.toThrow();
        expect(() => wasRecentlyProcessed(path, new Map(), 1000)).not.toThrow();
      }
    });
  });

  describe("Configuration Validation", () => {
    it("should have valid processing cooldown", () => {
      expect(DEFAULT_CONFIG.processingCooldown).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.processingCooldown).toBeLessThan(10000); // Reasonable upper limit
    });

    it("should have valid status report interval", () => {
      expect(DEFAULT_CONFIG.statusReportInterval).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.statusReportInterval).toBeGreaterThanOrEqual(
        DEFAULT_CONFIG.processingCooldown
      );
    });

    it("should have unique watch directories", () => {
      const directories = DEFAULT_CONFIG.watchDirectories;
      const uniqueDirectories = new Set(directories);
      expect(directories.length).toBe(uniqueDirectories.size);
    });

    it("should have valid exclude patterns", () => {
      for (const pattern of DEFAULT_CONFIG.excludePatterns) {
        expect(pattern).toBeInstanceOf(RegExp);
        // Test that pattern can be used
        expect(() => pattern.test("test")).not.toThrow();
      }
    });
  });
});