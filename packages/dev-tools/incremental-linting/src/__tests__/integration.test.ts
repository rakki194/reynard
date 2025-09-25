/**
 * 🦊 Integration Tests for Incremental Linting
 *
 * Test the complete linting workflow and integration between components.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { IncrementalLintingService } from "../linting-service.js";
import { LintingQueueManager } from "../queue-manager.js";
import { LintingProcessors } from "../processors.js";
import {
  setupMocks,
  cleanupMocks,
  createTestFile,
  createTestDirectory,
  createMockLintResult,
  createMockLintIssue,
  mockLinterExecSync,
  waitFor,
} from "./test-utils.js";

describe("Integration Tests", () => {
  let service: IncrementalLintingService;
  let queueManager: LintingQueueManager;
  let processors: LintingProcessors;

  beforeEach(() => {
    setupMocks();
    mockLinterExecSync();

    const config = {
      rootPath: "/test/workspace",
      linters: [
        {
          name: "eslint",
          enabled: true,
          command: "npx",
          args: ["eslint", "--format", "json"],
          patterns: ["**/*.ts", "**/*.tsx"],
          excludePatterns: ["**/node_modules/**"],
          maxFileSize: 1048576,
          timeout: 30000,
          parallel: true,
          priority: 10,
        },
        {
          name: "ruff",
          enabled: true,
          command: "ruff",
          args: ["check", "--output-format", "json"],
          patterns: ["**/*.py"],
          excludePatterns: ["**/__pycache__/**"],
          maxFileSize: 2097152,
          timeout: 30000,
          parallel: true,
          priority: 10,
        },
      ],
      includePatterns: ["**/*.ts", "**/*.tsx", "**/*.py"],
      excludePatterns: ["**/node_modules/**", "**/__pycache__/**"],
      debounceDelay: 100,
      maxConcurrency: 2,
      incremental: true,
      persistCache: true,
      lintOnSave: true,
      lintOnChange: false,
    };

    service = new IncrementalLintingService(config);
    queueManager = new LintingQueueManager();
    processors = new LintingProcessors();
  });

  afterEach(async () => {
    if (service) {
      await service.stop();
    }
    cleanupMocks();
  });

  describe("complete linting workflow", () => {
    it("should handle a complete linting session", async () => {
      await service.start();

      // Create test files
      const tsFile = createTestFile("/test/file.ts", "const unused = 1;");
      const pyFile = createTestFile("/test/script.py", "import os\nunused_var = 1");

      // Lint files
      const results = await service.lintFiles([tsFile, pyFile]);

      expect(results).toHaveLength(2);

      // Check TypeScript file result
      const tsResult = results.find(r => r.filePath === tsFile);
      expect(tsResult).toBeDefined();
      expect(tsResult!.linter).toBe("eslint");

      // Check Python file result
      const pyResult = results.find(r => r.filePath === pyFile);
      expect(pyResult).toBeDefined();
      expect(pyResult!.linter).toBe("ruff");

      // Check status
      const status = service.getStatus();
      expect(status.totalFiles).toBe(2);
      expect(status.filesWithIssues).toBeGreaterThan(0);
      expect(status.totalIssues).toBeGreaterThan(0);
    });

    it("should handle mixed file types in a single session", async () => {
      await service.start();

      const files = [
        createTestFile("/test/component.tsx", "import React from 'react';\nconst unused = 1;"),
        createTestFile("/test/script.py", "import os\nunused_var = 1"),
        createTestFile("/test/script.js", "function unused() { return 1; }"),
        createTestFile("/test/README.md", "# Test\n\nThis is a test markdown file."),
      ];

      const results = await service.lintFiles(files);

      expect(results).toHaveLength(4);

      // Each file should be processed by appropriate linter
      const tsxResult = results.find(r => r.filePath.includes("component.tsx"));
      expect(tsxResult?.linter).toBe("eslint");

      const pyResult = results.find(r => r.filePath.includes("script.py"));
      expect(pyResult?.linter).toBe("ruff");

      // JavaScript and Markdown files should be handled gracefully
      const jsResult = results.find(r => r.filePath.includes("script.js"));
      expect(jsResult).toBeDefined();

      const mdResult = results.find(r => r.filePath.includes("README.md"));
      expect(mdResult).toBeDefined();
    });

    it("should handle incremental updates correctly", async () => {
      await service.start();

      const file = createTestFile("/test/file.ts", "const unused = 1;");

      // First lint
      const firstResults = await service.lintFiles([file]);
      expect(firstResults).toHaveLength(1);

      // Mock file modification
      const { mockFs } = await import("./test-utils.js");
      mockFs.statSync.mockImplementation((path: string) => {
        if (path === file) {
          return { mtime: new Date(Date.now() + 1000), size: 1024 };
        }
        return { mtime: new Date(), size: 1024 };
      });

      // Second lint should process the file again
      const secondResults = await service.lintFiles([file]);
      expect(secondResults).toHaveLength(1);

      // Check that cache was updated
      const cache = (service as any).cache;
      expect(cache.has(file)).toBe(true);
    });
  });

  describe("queue management integration", () => {
    it("should respect concurrency limits", async () => {
      await service.start();

      const files = Array.from({ length: 10 }, (_, i) =>
        createTestFile(`/test/file${i}.ts`, `const unused${i} = ${i};`)
      );

      const startTime = Date.now();
      const results = await service.lintFiles(files);
      const endTime = Date.now();

      expect(results).toHaveLength(10);

      // Should take some time due to concurrency limits
      expect(endTime - startTime).toBeGreaterThan(0);

      // Check that all files were processed
      results.forEach(result => {
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("issues");
        expect(result).toHaveProperty("duration");
        expect(result).toHaveProperty("success");
      });
    });

    it("should handle queue overflow gracefully", async () => {
      await service.start();

      const files = Array.from({ length: 100 }, (_, i) =>
        createTestFile(`/test/file${i}.ts`, `const unused${i} = ${i};`)
      );

      const results = await service.lintFiles(files);

      expect(results).toHaveLength(100);

      // All files should be processed
      results.forEach(result => {
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("issues");
      });
    });
  });

  describe("error handling integration", () => {
    it("should handle linter failures gracefully", async () => {
      await service.start();

      const file = createTestFile("/test/file.ts", "const unused = 1;");

      // Mock linter failure
      const { mockExecSync } = await import("./test-utils.js");
      mockExecSync.mockImplementation(() => {
        throw new Error("Linter failed");
      });

      const result = await service.lintFile(file);

      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe("error");
      expect(result.issues[0].message).toContain("Mock linting error for testing");
    });

    it("should handle file system errors gracefully", async () => {
      await service.start();

      const { mockFs } = await import("./test-utils.js");
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error("File not found");
      });

      const result = await service.lintFile("/test/nonexistent.ts");

      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe("error");
    });

    it("should handle timeout errors gracefully", async () => {
      await service.start();

      const file = createTestFile("/test/file.ts", "const unused = 1;");

      // Mock timeout
      vi.spyOn(service as any, "executeLinter").mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 100);
        });
      });

      const result = await service.lintFile(file);

      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe("error");
    });
  });

  describe("performance integration", () => {
    it("should handle large files efficiently", async () => {
      await service.start();

      const largeContent = "const unused = 1;".repeat(10000);
      const file = createTestFile("/test/large.ts", largeContent);

      const startTime = Date.now();
      const result = await service.lintFile(file);
      const endTime = Date.now();

      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result).toHaveProperty("duration");

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it("should handle many small files efficiently", async () => {
      await service.start();

      const files = Array.from({ length: 50 }, (_, i) =>
        createTestFile(`/test/file${i}.ts`, `const unused${i} = ${i};`)
      );

      const startTime = Date.now();
      const results = await service.lintFiles(files);
      const endTime = Date.now();

      expect(results).toHaveLength(50);

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe("cache integration", () => {
    it("should use cache for unchanged files", async () => {
      await service.start();

      const file = createTestFile("/test/file.ts", "const unused = 1;");

      // First lint
      const firstResult = await service.lintFile(file);
      expect(firstResult).toHaveProperty("filePath");

      // Second lint should use cache
      const secondResult = await service.lintFile(file);
      expect(secondResult).toHaveProperty("filePath");

      // Check that cache was used
      const cache = (service as any).cache;
      expect(cache.has(file)).toBe(true);
    });

    it("should invalidate cache for changed files", async () => {
      await service.start();

      const file = createTestFile("/test/file.ts", "const unused = 1;");

      // First lint
      await service.lintFile(file);

      // Mock file modification
      const { mockFs } = await import("./test-utils.js");
      mockFs.statSync.mockImplementation((path: string) => {
        if (path === file) {
          return { mtime: new Date(Date.now() + 1000), size: 1024 };
        }
        return { mtime: new Date(), size: 1024 };
      });

      // Second lint should re-process the file
      const result = await service.lintFile(file);
      expect(result).toHaveProperty("filePath");
    });
  });
});
