/**
 * 🦦 Tests for WorkflowShellExtractor
 * Comprehensive test suite for the workflow shell script extraction and validation tool
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WorkflowShellExtractor } from "../WorkflowShellExtractor.js";
import { WorkflowLogger } from "../logger.js";
import type { ExtractorOptions } from "../types.js";

describe("WorkflowShellExtractor", () => {
  let extractor: WorkflowShellExtractor;
  let mockOptions: ExtractorOptions;

  beforeEach(() => {
    mockOptions = {
      workflowDir: ".github/workflows",
      tempDir: "/tmp/test_workflow_extraction",
      verbose: false,
      fixMode: false,
    };
    extractor = new WorkflowShellExtractor(mockOptions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default options", () => {
      const defaultExtractor = new WorkflowShellExtractor();
      expect(defaultExtractor).toBeInstanceOf(WorkflowShellExtractor);
    });

    it("should initialize with custom options", () => {
      const customExtractor = new WorkflowShellExtractor(mockOptions);
      expect(customExtractor).toBeInstanceOf(WorkflowShellExtractor);
    });
  });

  describe("logging", () => {
    it("should create logger instance", () => {
      const logger = new WorkflowLogger(true);
      expect(logger).toBeInstanceOf(WorkflowLogger);
    });

    it("should log messages with colors", () => {
      const logger = new WorkflowLogger(true);
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.log("Test message", "red");

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Test message"));

      consoleSpy.mockRestore();
    });
  });

  describe("script extraction", () => {
    it("should extract multi-line shell scripts", () => {
      const mockWorkflowContent = `
name: Test Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run tests
        run: |
          echo "Hello World"
          ls -la
          npm test
      - name: Another step
        run: echo "Done"
`;

      // Mock fs.readFileSync
      vi.spyOn(require("fs"), "readFileSync").mockReturnValue(mockWorkflowContent);

      const scripts = extractor.extractShellScripts("test.yml");

      expect(scripts).toHaveLength(1);
      expect(scripts[0]).toMatchObject({
        workflow: "test.yml",
        name: "line_9",
        startLine: 9,
        endLine: 9,
        type: "multiline",
      });
      expect(scripts[0].content).toContain('echo "Hello World"');
    });

    it("should handle empty workflow files", () => {
      const mockWorkflowContent = `
name: Empty Workflow
on: push
jobs:
  empty:
    runs-on: ubuntu-latest
    steps:
      - name: Empty step
        run: echo "No scripts here"
`;

      vi.spyOn(require("fs"), "readFileSync").mockReturnValue(mockWorkflowContent);

      const scripts = extractor.extractShellScripts("empty.yml");

      expect(scripts).toHaveLength(0);
    });
  });

  describe("validation", () => {
    it("should validate scripts with shellcheck", () => {
      // Mock successful shellcheck execution
      const execSyncSpy = vi.spyOn(require("child_process"), "execSync");
      execSyncSpy.mockImplementation(() => {
        return Buffer.from(""); // Empty output means no issues
      });

      const mockScript = {
        workflow: "test.yml",
        name: "test_script",
        startLine: 1,
        endLine: 3,
        content: 'echo "Hello World"',
        type: "multiline" as const,
      };

      const result = extractor.validateScript(mockScript);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);

      execSyncSpy.mockRestore();
    });

    it("should handle shellcheck errors", () => {
      // Mock shellcheck error
      const mockError = new Error("Shellcheck failed");
      (mockError as any).stdout = "SC2086: Double quote to prevent globbing and word splitting.";

      const execSyncSpy = vi.spyOn(require("child_process"), "execSync");
      execSyncSpy.mockImplementation(() => {
        throw mockError;
      });

      const mockScript = {
        workflow: "test.yml",
        name: "test_script",
        startLine: 1,
        endLine: 3,
        content: 'if [ $var ]; then echo "test"; fi',
        type: "multiline" as const,
      };

      const result = extractor.validateScript(mockScript);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);

      execSyncSpy.mockRestore();
    });
  });

  describe("fix generation", () => {
    it("should generate fixes for common issues", () => {
      const mockScript = {
        workflow: "test.yml",
        name: "test_script",
        startLine: 1,
        endLine: 3,
        content: 'if [ $var ]; then echo "test"; fi',
        type: "multiline" as const,
      };

      const mockValidationResult = {
        valid: false,
        issues: ["SC2292: Use [[ ]] instead of [ ]"],
        script: "/tmp/test.sh",
      };

      const fixes = extractor.generateFixes(mockScript, mockValidationResult);

      expect(fixes).toHaveLength(2); // Two fixes for SC2292
      expect(fixes[0].type).toBe("replace");
      expect(fixes[0].description).toContain("Replace [ ] with [[ ]]");
    });

    it("should return empty array for valid scripts", () => {
      const mockScript = {
        workflow: "test.yml",
        name: "test_script",
        startLine: 1,
        endLine: 3,
        content: 'echo "Hello World"',
        type: "multiline" as const,
      };

      const mockValidationResult = {
        valid: true,
        issues: [],
        script: "/tmp/test.sh",
      };

      const fixes = extractor.generateFixes(mockScript, mockValidationResult);

      expect(fixes).toHaveLength(0);
    });
  });
});
