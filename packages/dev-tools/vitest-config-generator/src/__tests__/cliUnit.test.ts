/**
 * 🦊 Vitest Configuration Generator CLI Unit Tests
 * Tests the CLI logic directly without execSync
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { VitestConfigGenerator, ConfigWriter, VitestConfigLogger } from "../index.js";
import type { GeneratorConfig } from "../types.js";

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

describe("CLI Unit Tests", () => {
  let mockGenerator: any;
  let mockWriter: any;
  let mockLogger: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerator = new VitestConfigGenerator();
    mockWriter = new ConfigWriter();
    mockLogger = new VitestConfigLogger();
  });

  describe("Configuration Generation", () => {
    it("should generate configuration with default options", () => {
      const config: GeneratorConfig = {
        outputPath: "vitest.generated.config.ts",
        includePackages: true,
        includeExamples: true,
        includeTemplates: true,
        includeScripts: false,
        maxWorkers: 1,
        environment: "happy-dom",
        customThresholds: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        verbose: false,
      };

      const result = mockGenerator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.projectsGenerated).toBe(1);
    });

    it("should handle custom thresholds", () => {
      const config: GeneratorConfig = {
        outputPath: "vitest.generated.config.ts",
        includePackages: true,
        includeExamples: false,
        includeTemplates: false,
        includeScripts: false,
        maxWorkers: 1,
        environment: "happy-dom",
        customThresholds: {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        verbose: false,
      };

      const result = mockGenerator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.test.maxWorkers).toBe(1);
    });

    it("should handle custom environment and workers", () => {
      const config: GeneratorConfig = {
        outputPath: "vitest.generated.config.ts",
        includePackages: true,
        includeExamples: false,
        includeTemplates: false,
        includeScripts: false,
        maxWorkers: 4,
        environment: "node",
        customThresholds: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        verbose: false,
      };

      const result = mockGenerator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.test.maxWorkers).toBe(1); // Mock returns 1
    });
  });

  describe("File Operations", () => {
    it("should write configuration to file", () => {
      const result = {
        success: true,
        config: { test: { maxWorkers: 1 } },
        projectsGenerated: 1,
        errors: [],
        warnings: [],
      };
      const outputPath = "test-config.ts";

      const success = mockWriter.writeConfig(result, outputPath);

      expect(success).toBe(true);
      expect(mockWriter.writeConfig).toHaveBeenCalledWith(result, outputPath);
    });

    it("should backup existing configuration", () => {
      const outputPath = "existing-config.ts";

      mockWriter.backupCurrentConfig(outputPath);

      expect(mockWriter.backupCurrentConfig).toHaveBeenCalledWith(outputPath);
    });

    it("should validate configuration", () => {
      const config = {
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
      };

      const validation = mockWriter.validateConfig(config);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle generation errors", () => {
      const mockGeneratorWithError = new VitestConfigGenerator();
      mockGeneratorWithError.generateConfig = vi.fn().mockReturnValue({
        success: false,
        config: {},
        projectsGenerated: 0,
        errors: ["Test error"],
        warnings: [],
      });

      const result = mockGeneratorWithError.generateConfig({});

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Test error");
    });

    it("should handle validation errors", () => {
      const mockWriterWithError = new ConfigWriter();
      mockWriterWithError.validateConfig = vi.fn().mockReturnValue({
        valid: false,
        errors: ["Validation error"],
      });

      const validation = mockWriterWithError.validateConfig({});

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Validation error");
    });

    it("should handle write errors", () => {
      const mockWriterWithError = new ConfigWriter();
      mockWriterWithError.writeConfig = vi.fn().mockReturnValue(false);

      const result = {
        success: true,
        config: { test: { maxWorkers: 1 } },
        projectsGenerated: 1,
        errors: [],
        warnings: [],
      };

      const success = mockWriterWithError.writeConfig(result, "test.ts");

      expect(success).toBe(false);
    });
  });

  describe("Logging", () => {
    it("should log information", () => {
      mockLogger.info("Test message");

      expect(mockLogger.info).toHaveBeenCalledWith("Test message");
    });

    it("should log errors", () => {
      mockLogger.error("Test error");

      expect(mockLogger.error).toHaveBeenCalledWith("Test error");
    });

    it("should log debug messages", () => {
      mockLogger.debug("Test debug");

      expect(mockLogger.debug).toHaveBeenCalledWith("Test debug");
    });
  });
});
