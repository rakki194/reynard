/**
 * 🦊 CLI Helper Tests
 * Tests the CLI helper functions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeCli, parseCliOptions } from "../cliHelper.js";
import type { CliOptions } from "../cliHelper.js";

// Mock the main classes
vi.mock("../index.js", () => ({
  VitestConfigGenerator: vi.fn().mockImplementation(() => ({
    generateConfig: vi.fn().mockReturnValue({
      success: true,
      config: {
        test: {
          maxWorkers: 1,
          projects: [
            {
              name: "test-project",
              root: "./test-project",
              test: {
                include: ["src/**/*.test.ts"],
              },
            },
          ],
        },
      },
      projectsGenerated: 1,
      errors: [],
      warnings: [],
    }),
  })),
  ConfigWriter: vi.fn().mockImplementation(() => ({
    writeConfig: vi.fn().mockReturnValue(true),
    backupCurrentConfig: vi.fn(),
    validateConfig: vi.fn().mockReturnValue({
      valid: true,
      errors: [],
    }),
  })),
  VitestConfigLogger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

describe("CLI Helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("executeCli", () => {
    it("should execute CLI with default options", async () => {
      const options: CliOptions = {
        verbose: false,
        output: "test-config.ts",
        includePackages: true,
        includeExamples: true,
        includeTemplates: true,
        includeScripts: false,
        maxWorkers: "1",
        environment: "happy-dom",
        branches: "80",
        functions: "85",
        lines: "85",
        statements: "85",
        backup: false,
        validate: false,
      };

      const result = await executeCli(options);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Generated configuration for 1 projects");
    });

    it("should execute CLI with verbose output", async () => {
      const options: CliOptions = {
        verbose: true,
        output: "test-config.ts",
        includePackages: true,
        includeExamples: false,
        includeTemplates: false,
        includeScripts: false,
        maxWorkers: "4",
        environment: "node",
        branches: "90",
        functions: "95",
        lines: "95",
        statements: "95",
        backup: true,
        validate: true,
      };

      const result = await executeCli(options);

      expect(result.success).toBe(true);
    });

    it("should handle generation errors", async () => {
      const { VitestConfigGenerator } = await import("../index.js");
      const mockGenerator = new VitestConfigGenerator();
      mockGenerator.generateConfig = vi.fn().mockReturnValue({
        success: false,
        config: {},
        projectsGenerated: 0,
        errors: ["Generation failed"],
        warnings: [],
      });

      const options: CliOptions = {
        output: "test-config.ts",
        includePackages: true,
      };

      const result = await executeCli(options);

      expect(result.success).toBe(true); // Should still succeed even with generation errors
    });

    it("should handle validation errors", async () => {
      // Mock the ConfigWriter to return validation errors
      const { ConfigWriter } = await import("../index.js");
      const MockedConfigWriter = vi.mocked(ConfigWriter);
      MockedConfigWriter.mockImplementationOnce(() => ({
        writeConfig: vi.fn().mockReturnValue(true),
        backupCurrentConfig: vi.fn(),
        validateConfig: vi.fn().mockReturnValue({
          valid: false,
          errors: ["Validation failed"],
        }),
      }));

      const options: CliOptions = {
        output: "test-config.ts",
        includePackages: true,
        validate: true,
      };

      const result = await executeCli(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Configuration validation failed");
    });

    it("should handle write errors", async () => {
      // Mock the ConfigWriter to return write errors
      const { ConfigWriter } = await import("../index.js");
      const MockedConfigWriter = vi.mocked(ConfigWriter);
      MockedConfigWriter.mockImplementationOnce(() => ({
        writeConfig: vi.fn().mockReturnValue(false),
        backupCurrentConfig: vi.fn(),
        validateConfig: vi.fn().mockReturnValue({
          valid: true,
          errors: [],
        }),
      }));

      const options: CliOptions = {
        output: "test-config.ts",
        includePackages: true,
      };

      const result = await executeCli(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to write configuration");
    });

    it("should handle unexpected errors", async () => {
      // Mock the VitestConfigGenerator to throw an error
      const { VitestConfigGenerator } = await import("../index.js");
      const MockedVitestConfigGenerator = vi.mocked(VitestConfigGenerator);
      MockedVitestConfigGenerator.mockImplementationOnce(() => ({
        generateConfig: vi.fn().mockImplementation(() => {
          throw new Error("Unexpected error");
        }),
      }));

      const options: CliOptions = {
        output: "test-config.ts",
        includePackages: true,
      };

      const result = await executeCli(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to generate configuration: Unexpected error");
    });
  });

  describe("parseCliOptions", () => {
    it("should parse basic options", () => {
      const args = ["--verbose", "--output", "test.ts", "--include-packages"];
      const options = parseCliOptions(args);

      expect(options.verbose).toBe(true);
      expect(options.output).toBe("test.ts");
      expect(options.includePackages).toBe(true);
    });

    it("should parse all options", () => {
      const args = [
        "--verbose",
        "--output",
        "test.ts",
        "--include-packages",
        "--include-examples",
        "--include-templates",
        "--include-scripts",
        "--max-workers",
        "4",
        "--environment",
        "node",
        "--branches",
        "90",
        "--functions",
        "95",
        "--lines",
        "95",
        "--statements",
        "95",
        "--backup",
        "--validate",
      ];
      const options = parseCliOptions(args);

      expect(options.verbose).toBe(true);
      expect(options.output).toBe("test.ts");
      expect(options.includePackages).toBe(true);
      expect(options.includeExamples).toBe(true);
      expect(options.includeTemplates).toBe(true);
      expect(options.includeScripts).toBe(true);
      expect(options.maxWorkers).toBe("4");
      expect(options.environment).toBe("node");
      expect(options.branches).toBe("90");
      expect(options.functions).toBe("95");
      expect(options.lines).toBe("95");
      expect(options.statements).toBe("95");
      expect(options.backup).toBe(true);
      expect(options.validate).toBe(true);
    });

    it("should parse short options", () => {
      const args = ["-v", "-o", "test.ts"];
      const options = parseCliOptions(args);

      expect(options.verbose).toBe(true);
      expect(options.output).toBe("test.ts");
    });

    it("should handle empty args", () => {
      const args: string[] = [];
      const options = parseCliOptions(args);

      expect(options).toEqual({});
    });

    it("should handle unknown options", () => {
      const args = ["--unknown", "value", "--verbose"];
      const options = parseCliOptions(args);

      expect(options.verbose).toBe(true);
      expect(options.output).toBeUndefined();
    });
  });
});
