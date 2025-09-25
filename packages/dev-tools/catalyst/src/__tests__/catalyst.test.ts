/**
 * ⚗️ Catalyst Package Tests
 * Basic tests to verify the catalyst package functionality
 */

import { describe, it, expect } from "vitest";
import { ReynardLogger } from "../logger/ReynardLogger.js";
import { FileTypeDetector } from "../file-utils/FileTypeDetector.js";
import { FileExclusionManager } from "../file-utils/FileExclusionManager.js";
import { FileManager } from "../file-utils/FileManager.js";
import { CLIUtils } from "../cli/CLIUtils.js";

describe("Catalyst Package", () => {
  describe("ReynardLogger", () => {
    it("should create logger instance", () => {
      const logger = new ReynardLogger();
      expect(logger).toBeDefined();
    });

    it("should support verbose mode", () => {
      const logger = new ReynardLogger({ verbose: true });
      expect(logger.isVerbose()).toBe(true);
    });

    it("should log messages with different levels", () => {
      const logger = new ReynardLogger();

      // These should not throw
      expect(() => logger.info("Test info")).not.toThrow();
      expect(() => logger.warn("Test warning")).not.toThrow();
      expect(() => logger.error("Test error")).not.toThrow();
      expect(() => logger.success("Test success")).not.toThrow();
      expect(() => logger.debug("Test debug")).not.toThrow();
    });
  });

  describe("FileTypeDetector", () => {
    it("should detect TypeScript files", () => {
      expect(FileTypeDetector.getFileType("src/index.ts")).toBe("typescript");
      expect(FileTypeDetector.getFileType("src/component.tsx")).toBe("typescript");
    });

    it("should detect JavaScript files", () => {
      expect(FileTypeDetector.getFileType("src/index.js")).toBe("javascript");
      expect(FileTypeDetector.getFileType("src/component.jsx")).toBe("javascript");
    });

    it("should detect Python files", () => {
      expect(FileTypeDetector.getFileType("src/main.py")).toBe("python");
    });

    it("should detect Markdown files", () => {
      expect(FileTypeDetector.getFileType("README.md")).toBe("markdown");
      expect(FileTypeDetector.getFileType("docs/index.mdx")).toBe("markdown");
    });

    it("should return null for unknown extensions", () => {
      expect(FileTypeDetector.getFileType("src/unknown.xyz")).toBe(null);
    });

    it("should get supported extensions", () => {
      const extensions = FileTypeDetector.getSupportedExtensions();
      expect(extensions).toContain(".ts");
      expect(extensions).toContain(".js");
      expect(extensions).toContain(".py");
      expect(extensions).toContain(".md");
    });

    it("should check if extension is supported", () => {
      expect(FileTypeDetector.isSupportedExtension(".ts")).toBe(true);
      expect(FileTypeDetector.isSupportedExtension(".js")).toBe(true);
      expect(FileTypeDetector.isSupportedExtension(".xyz")).toBe(false);
    });
  });

  describe("FileExclusionManager", () => {
    it("should exclude node_modules", () => {
      expect(FileExclusionManager.shouldExcludeFile("node_modules/package/index.js")).toBe(true);
      expect(FileExclusionManager.shouldExcludeFile("src/node_modules/test.js")).toBe(true);
    });

    it("should exclude dist directories", () => {
      expect(FileExclusionManager.shouldExcludeFile("dist/index.js")).toBe(true);
      expect(FileExclusionManager.shouldExcludeFile("build/output.js")).toBe(true);
    });

    it("should exclude git directories", () => {
      expect(FileExclusionManager.shouldExcludeFile(".git/config")).toBe(true);
    });

    it("should not exclude regular source files", () => {
      expect(FileExclusionManager.shouldExcludeFile("src/index.ts")).toBe(false);
      expect(FileExclusionManager.shouldExcludeFile("README.md")).toBe(false);
    });

    it("should provide exclusion reason", () => {
      const result = FileExclusionManager.shouldExcludeFileWithReason("node_modules/package/index.js");
      expect(result.excluded).toBe(true);
      expect(result.reason).toBe("Node modules");
    });

    it("should track recently processed files", () => {
      const recentlyProcessed = new Map<string, number>();
      const filePath = "src/test.ts";
      const cooldown = 1000; // 1 second

      // First call should not be recently processed
      expect(FileExclusionManager.wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)).toBe(false);

      // Second call should be recently processed
      expect(FileExclusionManager.wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)).toBe(true);
    });
  });

  describe("FileManager", () => {
    it("should create file manager instance", () => {
      const fileManager = new FileManager();
      expect(fileManager).toBeDefined();
    });

    it("should find project root", () => {
      const fileManager = new FileManager();
      const projectRoot = fileManager.getProjectRoot();
      expect(projectRoot).toBeDefined();
      expect(typeof projectRoot).toBe("string");
    });

    it("should check file exclusion", () => {
      const fileManager = new FileManager();
      expect(fileManager.shouldExcludeFile("node_modules/package/index.js")).toBe(true);
      expect(fileManager.shouldExcludeFile("src/index.ts")).toBe(false);
    });

    it("should get file type", () => {
      const fileManager = new FileManager();
      expect(fileManager.getFileType("src/index.ts")).toBe("typescript");
      expect(fileManager.getFileType("src/index.js")).toBe("javascript");
    });
  });

  describe("CLIUtils", () => {
    it("should parse common options", () => {
      const args = ["--verbose", "--backup", "--validate", "--output", "test.json"];
      const options = CLIUtils.parseCommonOptions(args);

      expect(options.verbose).toBe(true);
      expect(options.backup).toBe(true);
      expect(options.validate).toBe(true);
      expect(options.output).toBe("test.json");
    });

    it("should check for options", () => {
      const args = ["--verbose", "--backup"];
      expect(CLIUtils.hasOption(args, ["--verbose"])).toBe(true);
      expect(CLIUtils.hasOption(args, ["--validate"])).toBe(false);
    });

    it("should get option values", () => {
      const args = ["--output", "test.json", "--input", "source.txt"];
      expect(CLIUtils.getOptionValue(args, ["--output", "-o"])).toBe("test.json");
      expect(CLIUtils.getOptionValue(args, ["--input", "-i"])).toBe("source.txt");
    });

    it("should validate configurations", () => {
      const config = { name: "test", version: "1.0.0", description: "Test config" };
      const requiredFields = ["name", "version"];

      const result = CLIUtils.validateConfig(config, requiredFields);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing required fields", () => {
      const config = { name: "test" };
      const requiredFields = ["name", "version", "description"];

      const result = CLIUtils.validateConfig(config, requiredFields);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain("Missing required field: version");
      expect(result.errors).toContain("Missing required field: description");
    });

    it("should check development mode", () => {
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = "development";
      expect(CLIUtils.isDevelopment()).toBe(true);

      process.env.NODE_ENV = "production";
      expect(CLIUtils.isDevelopment()).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });

    it("should resolve paths", () => {
      const resolved = CLIUtils.resolvePath("test/file.txt");
      expect(resolved).toContain("test/file.txt");
    });

    it("should check file existence", () => {
      expect(CLIUtils.fileExists("package.json")).toBe(true);
      expect(CLIUtils.fileExists("nonexistent-file.xyz")).toBe(false);
    });
  });
});
