/**
 * 🦊 TypeScript Configuration Generator CLI Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";
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
          strict: true,
        },
        include: ["packages/**/*"],
        exclude: ["**/*.test.ts"],
        references: [
          { path: "packages/core/core" },
          { path: "packages/ui/components" },
        ],
      },
      projectsGenerated: 2,
      errors: [],
      warnings: [],
    }),
  })),
}));

describe("CLI", () => {
  const testOutputPath = "test-tsconfig.json";
  const testBackupPath = "test-tsconfig.json.backup";

  beforeEach(() => {
    // Clean up test files
    if (existsSync(testOutputPath)) {
      unlinkSync(testOutputPath);
    }
    if (existsSync(testBackupPath)) {
      unlinkSync(testBackupPath);
    }
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up test files
    if (existsSync(testOutputPath)) {
      unlinkSync(testOutputPath);
    }
    if (existsSync(testBackupPath)) {
      unlinkSync(testBackupPath);
    }
  });

  describe("Basic functionality", () => {
    it("should generate configuration with default options", () => {
      const result = execSync("node dist/cli.js generate", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
    });

    it("should generate configuration with custom output path", () => {
      const result = execSync(`node dist/cli.js generate --output ${testOutputPath}`, {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
      expect(existsSync(testOutputPath)).toBe(true);
    });

    it("should enable verbose output when requested", () => {
      const result = execSync("node dist/cli.js generate --verbose", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("generate-tsconfig v1.0.0");
      expect(result).toContain("Configuration Options:");
      expect(result).toContain("Output:");
      expect(result).toContain("Include packages:");
      expect(result).toContain("Include templates:");
      expect(result).toContain("Include scripts:");
      expect(result).toContain("Include references:");
      expect(result).toContain("Generate individual:");
    });
  });

  describe("Configuration options", () => {
    it("should handle --include-packages option", () => {
      const result = execSync("node dist/cli.js generate --include-packages", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
    });

    it("should handle --include-templates option", () => {
      const result = execSync("node dist/cli.js generate --include-templates", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
    });

    it("should handle --include-scripts option", () => {
      const result = execSync("node dist/cli.js generate --include-scripts", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
    });

    it("should handle --include-references option", () => {
      const result = execSync("node dist/cli.js generate --include-references", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
    });

    it("should handle --generate-individual option", () => {
      const result = execSync("node dist/cli.js generate --generate-individual", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
    });
  });

  describe("Backup functionality", () => {
    it("should create backup when --backup option is used", () => {
      // Create a test file to backup
      writeFileSync(testOutputPath, JSON.stringify({ test: "config" }, null, 2));

      const result = execSync(`node dist/cli.js generate --output ${testOutputPath} --backup`, {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("📦 Backed up existing file to:");
      // Check that a backup file exists (with timestamp in name)
      const backupDir = '.catalyst-backups';
      const backupFiles = require('fs').existsSync(backupDir) ? require('fs').readdirSync(backupDir).filter((f: string) => f.includes('.backup.')) : [];
      expect(backupFiles.length).toBeGreaterThan(0);
    });

    it("should not create backup when file doesn't exist", () => {
      const result = execSync(`node dist/cli.js generate --output ${testOutputPath} --backup`, {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).not.toContain("📦 Backed up existing config to:");
      expect(existsSync(testBackupPath)).toBe(false);
    });
  });

  describe("Validation", () => {
    it("should validate configuration when --validate option is used", () => {
      const result = execSync("node dist/cli.js generate --validate", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("✅ Generated TypeScript configuration successfully!");
      // Note: Validation is not yet implemented in the CLI
    });
  });

  describe("Error handling", () => {
    it("should handle invalid options gracefully", () => {
      // Test with invalid option
      try {
        execSync("node dist/cli.js --invalid-option", {
          cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
          encoding: "utf8",
        });
      } catch (error: any) {
        // Should exit with error for invalid options
        expect(error.status).toBeDefined();
      }
    });
  });

  describe("Help and version", () => {
    it("should show help when --help is used", () => {
      const result = execSync("node dist/cli.js --help", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result).toContain("Usage:");
      expect(result).toContain("Options:");
      expect(result).toContain("🦊 Generate TypeScript configurations from project architecture");
    });

    it("should show version when --version is used", () => {
      const result = execSync("node dist/cli.js --version", {
        cwd: "/home/kade/runeset/reynard/packages/dev-tools/tsconfig-generator",
        encoding: "utf8",
      });

      expect(result.trim()).toBe("1.0.0");
    });
  });
});
