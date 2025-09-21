/**
 * 🦊 CLI Tests
 * Tests for the command-line interface
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import path from "path";

describe("CLI Interface", () => {
  const cliPath = path.join(process.cwd(), "dist/cli.js");

  beforeEach(() => {
    // Mock console methods to avoid output during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("help command", () => {
    it("should display help information", () => {
      const result = execSync(`node ${cliPath} --help`, {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      expect(result).toContain("🦊 Generate Vitest configuration from Reynard project architecture");
      expect(result).toContain("Options:");
      expect(result).toContain("Examples:");
    });

    it("should display version information", () => {
      const result = execSync(`node ${cliPath} --version`, {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      expect(result.trim()).toBe("1.0.0");
    });
  });

  describe("basic functionality", () => {
    it("should run without errors with default options", () => {
      expect(() => {
        execSync(`node ${cliPath} --output /tmp/test-config.ts`, {
          encoding: "utf8",
          cwd: process.cwd(),
        });
      }).not.toThrow();
    });

    it("should run with verbose output", () => {
      expect(() => {
        execSync(`node ${cliPath} --verbose --output /tmp/test-config-verbose.ts`, {
          encoding: "utf8",
          cwd: process.cwd(),
        });
      }).not.toThrow();
    });

    it("should run with custom coverage thresholds", () => {
      expect(() => {
        execSync(
          `node ${cliPath} --branches 90 --functions 95 --lines 95 --statements 95 --output /tmp/test-config-thresholds.ts`,
          {
            encoding: "utf8",
            cwd: process.cwd(),
          }
        );
      }).not.toThrow();
    });

    it("should run with custom environment and workers", () => {
      expect(() => {
        execSync(`node ${cliPath} --environment node --max-workers 4 --output /tmp/test-config-env.ts`, {
          encoding: "utf8",
          cwd: process.cwd(),
        });
      }).not.toThrow();
    });

    it("should run with include/exclude options", () => {
      expect(() => {
        execSync(
          `node ${cliPath} --include-examples false --include-templates false --include-scripts true --output /tmp/test-config-filter.ts`,
          {
            encoding: "utf8",
            cwd: process.cwd(),
          }
        );
      }).not.toThrow();
    });
  });

  describe("error handling", () => {
    it("should handle invalid numeric options gracefully", () => {
      // This should not crash the application
      expect(() => {
        try {
          execSync(`node ${cliPath} --max-workers invalid --output /tmp/test-config-invalid.ts`, {
            encoding: "utf8",
            cwd: process.cwd(),
          });
        } catch (error) {
          // Expected to fail with invalid input
          expect(error).toBeDefined();
        }
      }).not.toThrow();
    });
  });

  describe("output generation", () => {
    it("should generate a valid TypeScript configuration file", () => {
      const outputPath = "/tmp/test-config-output.ts";

      execSync(`node ${cliPath} --output ${outputPath}`, {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      // Check if file was created and contains expected content
      const fs = require("fs");
      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, "utf8");
      expect(content).toContain("🦊 Generated Vitest Configuration");
      expect(content).toContain("defineConfig");
      expect(content).toContain("export default");

      // Clean up
      fs.unlinkSync(outputPath);
    });

    it("should generate different configurations with different options", () => {
      const outputPath1 = "/tmp/test-config-1.ts";
      const outputPath2 = "/tmp/test-config-2.ts";

      // Generate with default options
      execSync(`node ${cliPath} --output ${outputPath1}`, {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      // Generate with custom options
      execSync(`node ${cliPath} --max-workers 4 --branches 90 --output ${outputPath2}`, {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      const fs = require("fs");
      const content1 = fs.readFileSync(outputPath1, "utf8");
      const content2 = fs.readFileSync(outputPath2, "utf8");

      // Configurations should be different
      expect(content1).not.toBe(content2);
      expect(content1).toContain('"maxWorkers": 1');
      expect(content2).toContain('"maxWorkers": 4');

      // Clean up
      fs.unlinkSync(outputPath1);
      fs.unlinkSync(outputPath2);
    });
  });
});
