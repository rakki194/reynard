/**
 * 🦊 Tests for Types Integration
 *
 * Test that the type definitions work correctly with actual implementations.
 */

import { describe, it, expect } from "vitest";
import type {
  LintingService,
  LintingProcessor,
  LintResult,
  LintIssue,
  LintingQueueStatus,
  IncrementalLintingConfig,
  LinterConfig,
  LintingCacheEntry,
  LintingStats,
  LintSeverity,
  VSCodeIntegration,
} from "../types.js";

describe("Types Integration", () => {
  it("should create valid LintIssue objects", () => {
    const issue: LintIssue = {
      id: "test-issue-1",
      filePath: "/test/file.ts",
      line: 1,
      column: 1,
      severity: "error",
      message: "Test error message",
      source: "eslint",
    };

    expect(issue.id).toBe("test-issue-1");
    expect(issue.filePath).toBe("/test/file.ts");
    expect(issue.severity).toBe("error");
  });

  it("should create valid LintResult objects", () => {
    const result: LintResult = {
      filePath: "/test/file.ts",
      issues: [],
      success: true,
      duration: 100,
      linter: "eslint",
      timestamp: Date.now(),
    };

    expect(result.filePath).toBe("/test/file.ts");
    expect(result.success).toBe(true);
    expect(result.linter).toBe("eslint");
  });

  it("should create valid LinterConfig objects", () => {
    const config: LinterConfig = {
      name: "eslint",
      enabled: true,
      command: "npx",
      args: ["eslint", "--format", "json"],
      patterns: ["**/*.ts"],
      excludePatterns: ["**/node_modules/**"],
      maxFileSize: 1048576,
      timeout: 30000,
      parallel: true,
      priority: 10,
    };

    expect(config.name).toBe("eslint");
    expect(config.enabled).toBe(true);
    expect(config.patterns).toEqual(["**/*.ts"]);
  });

  it("should create valid IncrementalLintingConfig objects", () => {
    const config: IncrementalLintingConfig = {
      rootPath: "/test",
      linters: [],
      includePatterns: ["**/*.ts"],
      excludePatterns: ["**/node_modules/**"],
      debounceDelay: 100,
      maxConcurrency: 4,
      incremental: true,
      persistCache: true,
      lintOnSave: true,
      lintOnChange: false,
    };

    expect(config.rootPath).toBe("/test");
    expect(config.incremental).toBe(true);
    expect(config.maxConcurrency).toBe(4);
  });

  it("should create valid LintingQueueStatus objects", () => {
    const status: LintingQueueStatus = {
      isRunning: true,
      totalFiles: 10,
      filesWithIssues: 3,
      activeFiles: 2,
      queuedFiles: 5,
      failedFiles: 1,
      passedFiles: 4,
      totalIssues: 15,
      issuesBySeverity: {
        error: 5,
        warning: 8,
        info: 2,
        hint: 0,
      },
      averageLintTime: 150.5,
      totalQueues: 1,
      processingFiles: ["/test/file1.ts", "/test/file2.ts"],
      isProcessing: true,
      queueDetails: {},
    };

    expect(status.isRunning).toBe(true);
    expect(status.totalFiles).toBe(10);
    expect(status.issuesBySeverity.error).toBe(5);
  });

  it("should create valid LintingCacheEntry objects", () => {
    const cacheEntry: LintingCacheEntry = {
      filePath: "/test/file.ts",
      fileHash: "abc123",
      results: [],
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    expect(cacheEntry.filePath).toBe("/test/file.ts");
    expect(cacheEntry.fileHash).toBe("abc123");
    expect(cacheEntry.results).toEqual([]);
  });

  it("should create valid LintingStats objects", () => {
    const stats: LintingStats = {
      totalFiles: 100,
      filesWithIssues: 25,
      totalIssues: 150,
      issuesBySeverity: {
        error: 50,
        warning: 75,
        info: 20,
        hint: 5,
      },
      averageLintTime: 200.5,
    };

    expect(stats.totalFiles).toBe(100);
    expect(stats.filesWithIssues).toBe(25);
    expect(stats.issuesBySeverity.error).toBe(50);
  });

  it("should handle all LintSeverity values", () => {
    const severities: LintSeverity[] = ["error", "warning", "info", "hint"];
    
    severities.forEach(severity => {
      const issue: LintIssue = {
        id: "test",
        filePath: "/test.ts",
        line: 1,
        column: 1,
        severity,
        message: "Test",
        source: "test",
      };
      
      expect(issue.severity).toBe(severity);
    });
  });

  it("should create valid VSCodeIntegration objects", () => {
    const vscode: VSCodeIntegration = {
      enabled: true,
      showProblems: true,
      autoFix: false,
      formatOnSave: true,
    };

    expect(vscode.enabled).toBe(true);
    expect(vscode.showProblems).toBe(true);
    expect(vscode.autoFix).toBe(false);
    expect(vscode.formatOnSave).toBe(true);
  });

  it("should handle optional properties correctly", () => {
    const issue: LintIssue = {
      id: "test-issue-1",
      filePath: "/test/file.ts",
      line: 1,
      column: 1,
      severity: "error",
      message: "Test error message",
      source: "eslint",
      // Optional properties
      endLine: 1,
      endColumn: 10,
      rule: "no-unused-vars",
      fixable: true,
      fix: { range: [0, 10], text: "fixed" },
    };

    expect(issue.endLine).toBe(1);
    expect(issue.endColumn).toBe(10);
    expect(issue.rule).toBe("no-unused-vars");
    expect(issue.fixable).toBe(true);
    expect(issue.fix).toBeDefined();
  });
});
