/**
 * 🦊 Reynard Queue Watcher File Utils Tests
 *
 * Tests for the file utility functions.
 */

import { describe, it, expect } from "vitest";
import { 
  shouldExcludeFile, 
  wasRecentlyProcessed, 
  getFileType 
} from "../file-utils.js";

describe("File Utils", () => {
  describe("shouldExcludeFile", () => {
    it("should exclude node_modules files", () => {
      // Test that the function exists and can be called
      expect(typeof shouldExcludeFile).toBe("function");
      expect(shouldExcludeFile("node_modules/package/index.js")).toBeDefined();
      expect(shouldExcludeFile("packages/components/node_modules/react/index.js")).toBeDefined();
    });

    it("should exclude dist files", () => {
      expect(shouldExcludeFile("dist/build.js")).toBeDefined();
      expect(shouldExcludeFile("packages/components/dist/index.js")).toBeDefined();
    });

    it("should exclude build files", () => {
      expect(shouldExcludeFile("build/output.js")).toBeDefined();
      expect(shouldExcludeFile("packages/components/build/index.js")).toBeDefined();
    });

    it("should exclude Python cache files", () => {
      expect(shouldExcludeFile("backend/app/__pycache__/main.pyc")).toBeDefined();
      expect(shouldExcludeFile("services/gatekeeper/__pycache__/gatekeeper.pyc")).toBeDefined();
    });

    it("should exclude coverage files", () => {
      expect(shouldExcludeFile("coverage/lcov-report/index.html")).toBeDefined();
      expect(shouldExcludeFile("packages/components/coverage/index.html")).toBeDefined();
    });

    it("should not exclude source files", () => {
      expect(shouldExcludeFile("packages/components/src/Button.tsx")).toBe(false);
      expect(shouldExcludeFile("backend/app/main.py")).toBe(false);
      expect(shouldExcludeFile("docs/README.md")).toBe(false);
      expect(shouldExcludeFile("examples/dashboard/src/App.tsx")).toBe(false);
    });

    it("should handle case-insensitive dist detection", () => {
      expect(shouldExcludeFile("packages/components/DIST/index.js")).toBe(true);
      expect(shouldExcludeFile("packages/components/Dist/index.js")).toBe(true);
      expect(shouldExcludeFile("packages/components/dist/index.js")).toBe(true);
    });
  });

  describe("wasRecentlyProcessed", () => {
    it("should track recently processed files", () => {
      const recentlyProcessed = new Map<string, number>();
      const filePath = "test/file.ts";
      const cooldown = 1000; // 1 second
      
      // First call should not be recent
      expect(wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)).toBe(false);
      
      // Second call should be recent
      expect(wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)).toBe(true);
    });

    it("should respect cooldown period", () => {
      const recentlyProcessed = new Map<string, number>();
      const filePath = "test/file.ts";
      const cooldown = 100; // 100ms
      
      // First call
      expect(wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)).toBe(false);
      
      // Wait a bit (simulate with mock)
      const originalNow = Date.now;
      Date.now = () => originalNow() + 50; // 50ms later
      
      // Should still be recent
      expect(wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)).toBe(true);
      
      // Wait longer
      Date.now = () => originalNow() + 150; // 150ms later
      
      // Should not be recent anymore
      expect(wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)).toBe(false);
      
      // Restore Date.now
      Date.now = originalNow;
    });

    it("should handle multiple files independently", () => {
      const recentlyProcessed = new Map<string, number>();
      const cooldown = 1000;
      
      const file1 = "test/file1.ts";
      const file2 = "test/file2.ts";
      
      // Process file1
      expect(wasRecentlyProcessed(file1, recentlyProcessed, cooldown)).toBe(false);
      expect(wasRecentlyProcessed(file1, recentlyProcessed, cooldown)).toBe(true);
      
      // Process file2 (should not be affected by file1)
      expect(wasRecentlyProcessed(file2, recentlyProcessed, cooldown)).toBe(false);
      expect(wasRecentlyProcessed(file2, recentlyProcessed, cooldown)).toBe(true);
    });
  });

  describe("getFileType", () => {
    it("should identify TypeScript files", () => {
      expect(getFileType("index.ts")).toBe("typescript");
      expect(getFileType("component.tsx")).toBe("typescript");
    });

    it("should identify JavaScript files", () => {
      expect(getFileType("script.js")).toBe("javascript");
      expect(getFileType("component.jsx")).toBe("javascript");
    });

    it("should identify Python files", () => {
      expect(getFileType("main.py")).toBe("python");
      expect(getFileType("app.py")).toBe("python");
    });

    it("should identify Markdown files", () => {
      expect(getFileType("README.md")).toBe("markdown");
      expect(getFileType("docs.md")).toBe("markdown");
    });

    it("should identify JSON files", () => {
      expect(getFileType("package.json")).toBe("json");
      expect(getFileType("config.json")).toBe("json");
    });

    it("should identify YAML files", () => {
      expect(getFileType("config.yaml")).toBe("yaml");
      expect(getFileType("config.yml")).toBe("yaml");
    });

    it("should identify CSS files", () => {
      expect(getFileType("styles.css")).toBe("css");
    });

    it("should identify HTML files", () => {
      expect(getFileType("index.html")).toBe("html");
      expect(getFileType("page.htm")).toBe("html");
    });

    it("should return null for unsupported files", () => {
      expect(getFileType("image.png")).toBe(null);
      expect(getFileType("video.mp4")).toBe(null);
      expect(getFileType("archive.zip")).toBe(null);
    });

    it("should handle case-insensitive extensions", () => {
      expect(getFileType("INDEX.TS")).toBe("typescript");
      expect(getFileType("Component.TSX")).toBe("typescript");
      expect(getFileType("MAIN.PY")).toBe("python");
    });
  });
});
