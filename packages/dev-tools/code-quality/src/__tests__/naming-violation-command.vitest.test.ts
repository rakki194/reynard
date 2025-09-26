/**
 * 🦊 Naming Violation Command Vitest Tests
 *
 * Test suite for the naming violation command handler.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { handleNamingViolationCommand, type NamingViolationOptions } from "../commands/naming-violation-command";

// Mock console methods
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit called");
});

describe("handleNamingViolationCommand", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(process.cwd(), "test-naming-command-vitest");
    mkdirSync(testDir, { recursive: true });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("Basic Functionality", () => {
    it("should scan directory and report violations", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("🦊 Reynard Naming Violation Scanner");
      expect(mockConsoleLog).toHaveBeenCalledWith("=====================================");
      expect(mockConsoleLog).toHaveBeenCalledWith(`📁 Scanning: ${testDir}`);
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should exit with success when no violations found", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class ValidClass {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it("should use current working directory as default project path", async () => {
      const options: NamingViolationOptions = {
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith(`📁 Scanning: ${process.cwd()}`);
    });
  });

  describe("Output Formats", () => {
    it("should use summary format by default", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("📊 Format: summary");
    });

    it("should use specified format", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "json",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("📊 Format: json");
    });

    it("should use table format", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "table",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("📊 Format: table");
    });

    it("should use report format", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "report",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("📊 Format: report");
    });
  });

  describe("Severity Filtering", () => {
    it("should filter by error severity", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {} // error
        class VeryComplexDataProcessingEngine {} // warning
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        severity: "error",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("⚠️  Severity: error");
    });

    it("should filter by warning severity", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {} // error
        class VeryComplexDataProcessingEngine {} // warning
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        severity: "warning",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("⚠️  Severity: warning");
    });

    it("should show all severities by default", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {} // error
        class VeryComplexDataProcessingEngine {} // warning
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        severity: "all",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("⚠️  Severity: all");
    });
  });

  describe("Type Filtering", () => {
    it("should filter by class type", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {}
        interface EnhancedSecuritySystem {}
        function AdvancedDataProcessor() {}
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        type: "class",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("🏷️  Type: class");
    });

    it("should filter by interface type", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {}
        interface EnhancedSecuritySystem {}
        function AdvancedDataProcessor() {}
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        type: "interface",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("🏷️  Type: interface");
    });

    it("should show all types by default", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {}
        interface EnhancedSecuritySystem {}
        function AdvancedDataProcessor() {}
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        type: "all",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("🏷️  Type: all");
    });
  });

  describe("Fix Suggestions", () => {
    it("should generate fix suggestions when requested", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        fix: true,
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("🔧 Fix Suggestions");
      expect(mockConsoleLog).toHaveBeenCalledWith("==================");
    });

    it("should not generate fix suggestions when not requested", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        fix: false,
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      // Should not call fix suggestions
      expect(mockConsoleLog).not.toHaveBeenCalledWith("🔧 Fix Suggestions");
    });
  });

  describe("Output to File", () => {
    it("should write results to output file when specified", async () => {
      const testFile = join(testDir, "test.ts");
      const outputFile = join(testDir, "output.json");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        output: outputFile,
        format: "json",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith(`📄 Results written to: ${outputFile}`);
    });

    it("should not write to file when output not specified", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "json",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).not.toHaveBeenCalledWith(expect.stringContaining("Results written to:"));
    });
  });

  describe("Error Handling", () => {
    it("should handle scanning errors gracefully", async () => {
      const options: NamingViolationOptions = {
        project: "non-existent-directory",
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockProcessExit).toHaveBeenCalledWith(0); // Should exit with success for non-existent directory
    });

    it("should handle file writing errors", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      // Mock fs.writeFileSync to throw an error
      const mockWriteFileSync = vi.spyOn(require("fs"), "writeFileSync").mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const options: NamingViolationOptions = {
        project: testDir,
        output: "/invalid/path/output.json",
        format: "json",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleError).toHaveBeenCalledWith("❌ Error during naming violation scan:", expect.any(Error));
      expect(mockProcessExit).toHaveBeenCalledWith(1);

      mockWriteFileSync.mockRestore();
    });
  });

  describe("Summary Statistics", () => {
    it("should display correct summary statistics", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {} // error
        class VeryComplexDataProcessingEngine {} // warning
        class ValidClass {} // no violation
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("📊 Scan Summary");
      expect(mockConsoleLog).toHaveBeenCalledWith("===============");
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("⏱️  Duration:"));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("📁 Files scanned:"));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("❌ Total violations:"));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("🚨 Errors:"));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("⚠️  Warnings:"));
    });

    it("should display violations by type", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(
        testFile,
        `
        class UnifiedMetricsEngine {}
        interface EnhancedSecuritySystem {}
        function AdvancedDataProcessor() {}
      `
      );

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("📋 By type:");
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("class:"));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("interface:"));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining("function:"));
    });
  });

  describe("Exit Codes", () => {
    it("should exit with code 1 when errors are found", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should exit with code 0 when only warnings are found", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class VeryComplexDataProcessingEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it("should exit with code 0 when no violations are found", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class ValidClass {}");

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });
  });

  describe("Custom Exclude Patterns", () => {
    it("should apply custom exclude patterns", async () => {
      const testFile = join(testDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const options: NamingViolationOptions = {
        project: testDir,
        exclude: ["Unified"],
      };

      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).toHaveBeenCalledWith("📁 Scanning: " + testDir);
    });
  });

  describe("Performance", () => {
    it("should complete scanning within reasonable time", async () => {
      // Create multiple test files
      for (let i = 0; i < 10; i++) {
        const testFile = join(testDir, `test${i}.ts`);
        writeFileSync(testFile, "class UnifiedMetricsEngine {}");
      }

      const options: NamingViolationOptions = {
        project: testDir,
        format: "summary",
      };

      const startTime = Date.now();
      await expect(handleNamingViolationCommand(options)).rejects.toThrow("process.exit called");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });
});
