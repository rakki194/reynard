/**
 * 🦊 Tests for Linting Queue Manager
 *
 * Test the LintingQueueManager functionality.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { LintingProcessor, LintResult, LinterConfig } from "../types.js";

// Mock the FileQueueManager
vi.mock("reynard-queue-watcher", () => {
  const mockGetStatus = vi.fn().mockReturnValue({
    totalQueues: 1,
    processingFiles: [],
    isProcessing: false,
    queueDetails: {},
  });
  
  const MockFileQueueManager = vi.fn().mockImplementation(function() {
    this.getStatus = mockGetStatus;
  });
  
  return {
    FileQueueManager: MockFileQueueManager,
  };
});

// Import after mocking
import { LintingQueueManager } from "../queue-manager.js";

// Mock processor for testing
class MockProcessor implements LintingProcessor {
  constructor(public config: LinterConfig) {}

  async process(filePath: string): Promise<LintResult> {
    return {
      filePath,
      issues: [],
      success: true,
      duration: 100,
      linter: this.config.name,
      timestamp: Date.now(),
    };
  }

  canProcess(filePath: string): boolean {
    return true;
  }

  getLinterName(): string {
    return this.config.name;
  }
}

describe("LintingQueueManager", () => {
  let queueManager: LintingQueueManager;
  let mockProcessor: MockProcessor;

  beforeEach(() => {
    queueManager = new LintingQueueManager();
    mockProcessor = new MockProcessor({
      name: "eslint",
      command: "eslint",
      patterns: ["**/*.ts"],
      excludePatterns: [],
      maxFileSize: 1024,
      timeout: 30000,
      parallel: true,
      priority: 10,
      enabled: true,
    });
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default options", () => {
      const manager = new LintingQueueManager();
      expect(manager).toBeDefined();
    });

    it("should initialize with custom options", () => {
      const options = { maxConcurrency: 2 };
      const manager = new LintingQueueManager(options);
      expect(manager).toBeDefined();
    });
  });

  describe("registerLintingProcessor", () => {
    it("should register a linting processor", () => {
      // This method is currently a no-op, but we can test it doesn't throw
      expect(() => {
        queueManager.registerLintingProcessor("eslint", mockProcessor, {});
      }).not.toThrow();
    });

    it("should handle processor registration with options", () => {
      expect(() => {
        queueManager.registerLintingProcessor("eslint", mockProcessor, {
          priority: 10,
          timeout: 30000,
        });
      }).not.toThrow();
    });
  });

  describe("getLintingStatus", () => {
    it("should return linting-specific status", () => {
      const status = queueManager.getLintingStatus();
      
      expect(status).toBeDefined();
      expect(status.isRunning).toBe(false); // Based on mock
      expect(status.totalFiles).toBe(0);
      expect(status.filesWithIssues).toBe(0);
      expect(status.activeFiles).toBe(0);
      expect(status.queuedFiles).toBe(0);
      expect(status.failedFiles).toBe(0);
      expect(status.passedFiles).toBe(0);
      expect(status.totalIssues).toBe(0);
      expect(status.averageLintTime).toBe(0);
      expect(status.issuesBySeverity).toEqual({
        error: 0,
        warning: 0,
        info: 0,
        hint: 0,
      });
    });

    it("should include base status properties", () => {
      const status = queueManager.getLintingStatus();
      
      expect(status.totalQueues).toBe(1);
      expect(status.processingFiles).toEqual([]);
      expect(status.isProcessing).toBe(false);
      expect(status.queueDetails).toEqual({});
    });
  });

  describe("updateLintingStats", () => {
    it("should update statistics for successful result with no issues", () => {
      const result: LintResult = {
        filePath: "/test/file.ts",
        issues: [],
        success: true,
        duration: 100,
        linter: "eslint",
        timestamp: Date.now(),
      };

      queueManager.updateLintingStats(result);
      
      const status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(1);
      expect(status.filesWithIssues).toBe(0);
      expect(status.totalIssues).toBe(0);
      expect(status.averageLintTime).toBe(100);
    });

    it("should update statistics for result with issues", () => {
      const result: LintResult = {
        filePath: "/test/file.ts",
        issues: [
          {
            id: "error-1",
            filePath: "/test/file.ts",
            line: 1,
            column: 1,
            severity: "error",
            message: "Test error",
            source: "eslint",
          },
          {
            id: "warning-1",
            filePath: "/test/file.ts",
            line: 2,
            column: 5,
            severity: "warning",
            message: "Test warning",
            source: "eslint",
          },
        ],
        success: true,
        duration: 150,
        linter: "eslint",
        timestamp: Date.now(),
      };

      queueManager.updateLintingStats(result);
      
      const status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(1);
      expect(status.filesWithIssues).toBe(1);
      expect(status.totalIssues).toBe(2);
      expect(status.averageLintTime).toBe(150);
    });

    it("should calculate average lint time correctly", () => {
      const result1: LintResult = {
        filePath: "/test/file1.ts",
        issues: [],
        success: true,
        duration: 100,
        linter: "eslint",
        timestamp: Date.now(),
      };

      const result2: LintResult = {
        filePath: "/test/file2.ts",
        issues: [],
        success: true,
        duration: 200,
        linter: "eslint",
        timestamp: Date.now(),
      };

      queueManager.updateLintingStats(result1);
      queueManager.updateLintingStats(result2);
      
      const status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(2);
      expect(status.averageLintTime).toBe(150); // (100 + 200) / 2
    });

    it("should handle multiple files with mixed results", () => {
      const results: LintResult[] = [
        {
          filePath: "/test/file1.ts",
          issues: [],
          success: true,
          duration: 100,
          linter: "eslint",
          timestamp: Date.now(),
        },
        {
          filePath: "/test/file2.ts",
          issues: [
            {
              id: "error-1",
              filePath: "/test/file2.ts",
              line: 1,
              column: 1,
              severity: "error",
              message: "Test error",
              source: "eslint",
            },
          ],
          success: true,
          duration: 200,
          linter: "eslint",
          timestamp: Date.now(),
        },
        {
          filePath: "/test/file3.ts",
          issues: [
            {
              id: "warning-1",
              filePath: "/test/file3.ts",
              line: 1,
              column: 1,
              severity: "warning",
              message: "Test warning",
              source: "eslint",
            },
            {
              id: "warning-2",
              filePath: "/test/file3.ts",
              line: 2,
              column: 5,
              severity: "warning",
              message: "Another warning",
              source: "eslint",
            },
          ],
          success: true,
          duration: 300,
          linter: "eslint",
          timestamp: Date.now(),
        },
      ];

      results.forEach(result => queueManager.updateLintingStats(result));
      
      const status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(3);
      expect(status.filesWithIssues).toBe(2); // file2 and file3 have issues
      expect(status.totalIssues).toBe(3); // 1 error + 2 warnings
      expect(status.averageLintTime).toBe(200); // (100 + 200 + 300) / 3
    });
  });

  describe("resetLintingStats", () => {
    it("should reset all statistics to zero", () => {
      // First, add some statistics
      const result: LintResult = {
        filePath: "/test/file.ts",
        issues: [
          {
            id: "error-1",
            filePath: "/test/file.ts",
            line: 1,
            column: 1,
            severity: "error",
            message: "Test error",
            source: "eslint",
          },
        ],
        success: true,
        duration: 100,
        linter: "eslint",
        timestamp: Date.now(),
      };

      queueManager.updateLintingStats(result);
      
      // Verify statistics are set
      let status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(1);
      expect(status.filesWithIssues).toBe(1);
      expect(status.totalIssues).toBe(1);
      expect(status.averageLintTime).toBe(100);
      
      // Reset statistics
      queueManager.resetLintingStats();
      
      // Verify statistics are reset
      status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(0);
      expect(status.filesWithIssues).toBe(0);
      expect(status.totalIssues).toBe(0);
      expect(status.averageLintTime).toBe(0);
    });

    it("should work when no statistics have been recorded", () => {
      // Reset without any previous statistics
      expect(() => {
        queueManager.resetLintingStats();
      }).not.toThrow();
      
      const status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(0);
      expect(status.filesWithIssues).toBe(0);
      expect(status.totalIssues).toBe(0);
      expect(status.averageLintTime).toBe(0);
    });
  });

  describe("integration", () => {
    it("should work with real processor", async () => {
      const processor = new MockProcessor({
        name: "test-processor",
        enabled: true,
        command: "test",
        args: [],
        patterns: ["**/*.ts"],
        excludePatterns: [],
        maxFileSize: 1024,
        timeout: 30000,
      });

      // Register processor
      queueManager.registerLintingProcessor("test", processor);
      
      // Process a file
      const result = await processor.process("/test/file.ts");
      
      // Update statistics
      queueManager.updateLintingStats(result);
      
      // Check status
      const status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(1);
      expect(status.averageLintTime).toBe(100);
    });

    it("should handle edge case with zero duration", () => {
      const result: LintResult = {
        filePath: "/test/file.ts",
        issues: [],
        success: true,
        duration: 0,
        linter: "eslint",
        timestamp: Date.now(),
      };

      queueManager.updateLintingStats(result);
      
      const status = queueManager.getLintingStatus();
      expect(status.totalFiles).toBe(1);
      expect(status.averageLintTime).toBe(0);
    });
  });
});
