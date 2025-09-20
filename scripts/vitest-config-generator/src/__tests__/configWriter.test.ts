/**
 * 🦊 Configuration Writer Tests
 * Tests for the ConfigWriter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { ConfigWriter } from "../configWriter.js";
import { VitestConfigLogger } from "../logger.js";
import type { VitestGlobalConfig, GeneratorResult } from "../types.js";

// Mock fs module
vi.mock("fs");

describe("ConfigWriter", () => {
  let writer: ConfigWriter;
  let logger: VitestConfigLogger;
  let mockFs: typeof fs;

  beforeEach(() => {
    logger = new VitestConfigLogger(false);
    writer = new ConfigWriter(logger);
    mockFs = vi.mocked(fs);
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("writeConfig", () => {
    const mockConfig: VitestGlobalConfig = {
      test: {
        maxWorkers: 1,
        projects: [
          {
            name: "test-project",
            root: "./test-project",
            test: {
              include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
            },
          },
        ],
      },
    };

    const mockResult: GeneratorResult = {
      success: true,
      config: mockConfig,
      projectsGenerated: 1,
      errors: [],
      warnings: [],
    };

    it("should write configuration to file successfully", () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = writer.writeConfig(mockResult, "test-config.ts");

      expect(result).toBe(true);
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("test-config.ts"),
        expect.stringContaining("defineConfig"),
        "utf8"
      );
    });

    it("should create directory if it doesn't exist", () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      writer.writeConfig(mockResult, "deep/path/test-config.ts");

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining("deep/path"),
        { recursive: true }
      );
    });

    it("should not create directory if it already exists", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {});

      writer.writeConfig(mockResult, "test-config.ts");

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });

    it("should return false if generation failed", () => {
      const failedResult: GeneratorResult = {
        success: false,
        config: {} as VitestGlobalConfig,
        projectsGenerated: 0,
        errors: ["Generation failed"],
        warnings: [],
      };

      const result = writer.writeConfig(failedResult, "test-config.ts");

      expect(result).toBe(false);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it("should handle file system errors", () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error("Write failed");
      });

      const result = writer.writeConfig(mockResult, "test-config.ts");

      expect(result).toBe(false);
    });

    it("should generate proper TypeScript configuration content", () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      writer.writeConfig(mockResult, "test-config.ts");

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain("🦊 Generated Vitest Configuration");
      expect(content).toContain("defineConfig");
      expect(content).toContain("export default");
      expect(content).toContain("Auto-generated from project architecture");
    });
  });

  describe("backupCurrentConfig", () => {
    it("should backup existing configuration file", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.copyFileSync.mockImplementation(() => {});

      const result = writer.backupCurrentConfig("existing-config.ts");

      expect(result).toBe(true);
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        "existing-config.ts",
        expect.stringContaining("existing-config.ts.backup.")
      );
    });

    it("should return true if no existing config to backup", () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = writer.backupCurrentConfig("non-existent-config.ts");

      expect(result).toBe(true);
      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
    });

    it("should handle backup errors", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.copyFileSync.mockImplementation(() => {
        throw new Error("Backup failed");
      });

      const result = writer.backupCurrentConfig("existing-config.ts");

      expect(result).toBe(false);
    });
  });

  describe("validateConfig", () => {
    it("should validate a correct configuration", () => {
      const validConfig: VitestGlobalConfig = {
        test: {
          maxWorkers: 1,
          projects: [
            {
              name: "test-project",
              root: "./test-project",
              test: {
                include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
              },
            },
          ],
        },
      };

      const result = writer.validateConfig(validConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing test configuration", () => {
      const invalidConfig = {} as VitestGlobalConfig;

      const result = writer.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required 'test' configuration");
    });

    it("should detect missing projects array", () => {
      const invalidConfig: VitestGlobalConfig = {
        test: {
          maxWorkers: 1,
        } as any,
      };

      const result = writer.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing or invalid 'test.projects' array");
    });

    it("should detect invalid project configurations", () => {
      const invalidConfig: VitestGlobalConfig = {
        test: {
          maxWorkers: 1,
          projects: [
            {
              name: "",
              root: "",
              test: {
                include: [],
              },
            },
            {
              name: "valid-project",
              root: "./valid-project",
              test: {
                include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
              },
            },
          ],
        },
      };

      const result = writer.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Project 0: missing name");
      expect(result.errors).toContain("Project 0: missing root path");
    });

    it("should detect missing test include patterns", () => {
      const invalidConfig: VitestGlobalConfig = {
        test: {
          maxWorkers: 1,
          projects: [
            {
              name: "test-project",
              root: "./test-project",
              test: {
                include: [],
              },
            },
          ],
        },
      };

      const result = writer.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Project 0: missing test include patterns");
    });
  });
});
