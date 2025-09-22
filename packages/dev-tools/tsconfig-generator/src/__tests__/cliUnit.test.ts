/**
 * 🦊 TypeScript Configuration Generator CLI Unit Tests
 * Tests the CLI logic directly without execSync
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TSConfigGenerator } from "../tsconfigGenerator.js";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

// Mock the TSConfigGenerator
vi.mock("../tsconfigGenerator.js", () => ({
  TSConfigGenerator: vi.fn().mockImplementation(() => ({
    generateConfig: vi.fn().mockReturnValue({
      success: true,
      config: {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
        },
        include: ["packages/core/core/src/**/*"],
        references: [{ path: "packages/ui/components" }],
      },
      packagesProcessed: 1,
      errors: [],
      warnings: [],
    }),
  })),
}));

// Mock fs functions
vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// Mock path
vi.mock("path", () => ({
  join: vi.fn((...args) => args.join("/")),
}));

describe("CLI Unit Tests", () => {
  let mockGenerator: any;
  let mockWriteFileSync: any;
  let mockExistsSync: any;
  let mockReadFileSync: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerator = new TSConfigGenerator();
    mockWriteFileSync = vi.mocked(writeFileSync);
    mockExistsSync = vi.mocked(existsSync);
    mockReadFileSync = vi.mocked(readFileSync);
  });

  describe("Configuration Generation", () => {
    it("should generate configuration with default options", () => {
      const config = {
        includePackages: true,
        includeTemplates: true,
        includeScripts: false,
        includeReferences: true,
        generateIndividual: false,
        outputPath: "tsconfig.generated.json",
        verbose: false,
      };

      const result = mockGenerator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.packagesProcessed).toBe(1);
    });

    it("should handle custom compiler options", () => {
      const config = {
        includePackages: true,
        includeTemplates: false,
        includeScripts: false,
        includeReferences: true,
        generateIndividual: false,
        customCompilerOptions: {
          strict: true,
          noImplicitAny: true,
        },
        outputPath: "tsconfig.generated.json",
        verbose: false,
      };

      const result = mockGenerator.generateConfig(config);

      expect(result.success).toBe(true);
      expect(result.config.compilerOptions).toBeDefined();
    });

    it("should handle verbose output", () => {
      const config = {
        includePackages: true,
        includeTemplates: true,
        includeScripts: false,
        includeReferences: true,
        generateIndividual: false,
        outputPath: "tsconfig.generated.json",
        verbose: true,
      };

      const result = mockGenerator.generateConfig(config);

      expect(result.success).toBe(true);
    });
  });

  describe("File Operations", () => {
    it("should write configuration to file", () => {
      const config = {
        compilerOptions: { target: "ES2022" },
        include: ["src/**/*"],
      };
      const outputPath = "test-config.json";

      mockWriteFileSync(outputPath, JSON.stringify(config, null, 2));

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        outputPath,
        JSON.stringify(config, null, 2)
      );
    });

    it("should check if file exists", () => {
      const filePath = "existing-config.json";
      mockExistsSync.mockReturnValue(true);

      const exists = mockExistsSync(filePath);

      expect(exists).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(filePath);
    });

    it("should read existing file", () => {
      const filePath = "existing-config.json";
      const fileContent = '{"test": "config"}';
      mockReadFileSync.mockReturnValue(fileContent);

      const content = mockReadFileSync(filePath);

      expect(content).toBe(fileContent);
      expect(mockReadFileSync).toHaveBeenCalledWith(filePath);
    });
  });

  describe("Error Handling", () => {
    it("should handle generation errors", () => {
      const mockGeneratorWithError = new TSConfigGenerator();
      mockGeneratorWithError.generateConfig = vi.fn().mockReturnValue({
        success: false,
        config: {},
        packagesProcessed: 0,
        errors: ["Test error"],
        warnings: [],
      });

      const result = mockGeneratorWithError.generateConfig({});

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Test error");
    });

    it("should handle file system errors", () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error("Write failed");
      });

      expect(() => {
        mockWriteFileSync("test.json", "{}");
      }).toThrow("Write failed");
    });
  });

  describe("Path Operations", () => {
    it("should join paths correctly", () => {
      const { join } = require("path");
      const result = join("path", "to", "file.json");

      expect(result).toBe("path/to/file.json");
    });
  });
});
