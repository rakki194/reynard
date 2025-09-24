/**
 * 🦊 Tests for Types
 *
 * Test type definitions and interfaces.
 */

import { describe, it, expect } from "vitest";
import type { LintResult, LintIssue, LinterConfig, LintingQueueStatus } from "../types.js";
import { 
  createMockLintResult, 
  createMockLintIssue, 
  createMockLinterConfig,
  expectLintResult,
  expectLintIssue,
  expectLinterConfig
} from "./test-utils.js";

describe("Types", () => {
  describe("LintIssue", () => {
    it("should create a valid LintIssue", () => {
      const issue = createMockLintIssue("Test message", "error", 1, 1);
      expectLintIssue(issue);
    });

    it("should handle different severity levels", () => {
      const severities: Array<"error" | "warning" | "info" | "hint"> = ["error", "warning", "info", "hint"];
      
      severities.forEach(severity => {
        const issue = createMockLintIssue("Test message", severity, 1, 1);
        expect(issue.severity).toBe(severity);
        expectLintIssue(issue);
      });
    });

    it("should handle line and column positions", () => {
      const issue = createMockLintIssue("Test message", "error", 10, 20);
      expect(issue.line).toBe(10);
      expect(issue.column).toBe(20);
      expect(issue.endLine).toBe(10);
      expect(issue.endColumn).toBe(30);
    });
  });

  describe("LintResult", () => {
    it("should create a valid LintResult", () => {
      const result = createMockLintResult("/test/file.ts", []);
      expectLintResult(result);
    });

    it("should handle results with issues", () => {
      const issues = [
        createMockLintIssue("Error 1", "error", 1, 1),
        createMockLintIssue("Warning 1", "warning", 2, 5),
      ];
      const result = createMockLintResult("/test/file.ts", issues);
      
      expectLintResult(result);
      expect(result.issues).toHaveLength(2);
      expect(result.success).toBe(false);
    });

    it("should handle successful results", () => {
      const result = createMockLintResult("/test/file.ts", []);
      expectLintResult(result);
      expect(result.issues).toHaveLength(0);
      expect(result.success).toBe(true);
    });

    it("should include timing information", () => {
      const result = createMockLintResult("/test/file.ts", []);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.timestamp).toBeGreaterThan(0);
    });
  });

  describe("LinterConfig", () => {
    it("should create a valid LinterConfig", () => {
      const config = createMockLinterConfig("test-linter", ["**/*.ts"]);
      expectLinterConfig(config);
    });

    it("should handle different file patterns", () => {
      const patterns = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"];
      const config = createMockLinterConfig("eslint", patterns);
      
      expectLinterConfig(config);
      expect(config.patterns).toEqual(patterns);
    });

    it("should handle exclusion patterns", () => {
      const excludePatterns = ["**/node_modules/**", "**/dist/**"];
      const config = createMockLinterConfig("test-linter", ["**/*.ts"]);
      config.excludePatterns = excludePatterns;
      
      expectLinterConfig(config);
      expect(config.excludePatterns).toEqual(excludePatterns);
    });

    it("should handle configuration options", () => {
      const config = createMockLinterConfig("test-linter", ["**/*.ts"]);
      config.maxFileSize = 2097152;
      config.timeout = 60000;
      config.parallel = false;
      config.priority = 5;
      
      expectLinterConfig(config);
      expect(config.maxFileSize).toBe(2097152);
      expect(config.timeout).toBe(60000);
      expect(config.parallel).toBe(false);
      expect(config.priority).toBe(5);
    });
  });

  describe("LintingQueueStatus", () => {
    it("should create a valid LintingQueueStatus", () => {
      const status: LintingQueueStatus = {
        totalQueues: 1,
        processingFiles: 0,
        isProcessing: false,
        queueDetails: [],
        activeFiles: 0,
        queuedFiles: 0,
        failedFiles: 0,
        passedFiles: 0,
        totalIssues: 0,
        issuesBySeverity: {
          error: 0,
          warning: 0,
          info: 0,
          hint: 0,
        },
        averageLintTime: 0,
      };

      expect(status).toHaveProperty("totalQueues");
      expect(status).toHaveProperty("processingFiles");
      expect(status).toHaveProperty("isProcessing");
      expect(status).toHaveProperty("queueDetails");
      expect(status).toHaveProperty("activeFiles");
      expect(status).toHaveProperty("queuedFiles");
      expect(status).toHaveProperty("failedFiles");
      expect(status).toHaveProperty("passedFiles");
      expect(status).toHaveProperty("totalIssues");
      expect(status).toHaveProperty("issuesBySeverity");
      expect(status).toHaveProperty("averageLintTime");

      expect(typeof status.totalQueues).toBe("number");
      expect(typeof status.processingFiles).toBe("number");
      expect(typeof status.isProcessing).toBe("boolean");
      expect(Array.isArray(status.queueDetails)).toBe(true);
      expect(typeof status.activeFiles).toBe("number");
      expect(typeof status.queuedFiles).toBe("number");
      expect(typeof status.failedFiles).toBe("number");
      expect(typeof status.passedFiles).toBe("number");
      expect(typeof status.totalIssues).toBe("number");
      expect(typeof status.averageLintTime).toBe("number");

      expect(status.issuesBySeverity).toHaveProperty("error");
      expect(status.issuesBySeverity).toHaveProperty("warning");
      expect(status.issuesBySeverity).toHaveProperty("info");
      expect(status.issuesBySeverity).toHaveProperty("hint");
    });
  });
});
