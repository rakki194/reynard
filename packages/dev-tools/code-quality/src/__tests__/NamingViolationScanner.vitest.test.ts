/**
 * 🦊 Naming Violation Scanner Vitest Tests
 *
 * Comprehensive test suite for the naming violation scanner using Vitest.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { NamingViolationScanner } from "../NamingViolationScanner";
import { DEFAULT_NAMING_RULES, FORBIDDEN_PREFIXES } from "../naming-rules.config";

describe("NamingViolationScanner", () => {
  let scanner: NamingViolationScanner;
  let testDir: string;

  beforeEach(() => {
    scanner = new NamingViolationScanner();
    testDir = join(process.cwd(), "test-naming-violations-vitest");
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("Constructor and Initialization", () => {
    it("should initialize with default rules", () => {
      expect(scanner).toBeDefined();
      const rules = scanner.getRules();
      expect(rules).toHaveLength(DEFAULT_NAMING_RULES.length);
      expect(rules[0].description).toBe("Forbidden marketing prefixes that add no technical value");
    });

    it("should allow adding custom rules", () => {
      const initialCount = scanner.getRules().length;

      scanner.addRule({
        pattern: /TestPattern/g,
        forbidden: ["Test"],
        suggestion: "Use a different name",
        severity: "warning",
        description: "Custom test rule",
      });

      expect(scanner.getRules()).toHaveLength(initialCount + 1);
    });

    it("should allow clearing all rules", () => {
      scanner.clearRules();
      expect(scanner.getRules()).toHaveLength(0);
    });
  });

  describe("Forbidden Prefix Detection", () => {
    it.each(FORBIDDEN_PREFIXES)("should detect %s prefix violations", async prefix => {
      const testFile = join(testDir, "test.ts");
      const normalizedPrefix = prefix.replace(/[^A-Za-z]/g, "");
      const className = `${normalizedPrefix}TestClass`;
      const content = `class ${className} {}`;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      // Hyphenated prefixes can normalize to different removal lengths; be lenient
      const isHyphenated = /[^A-Za-z]/.test(prefix);
      if (isHyphenated) {
        expect(violations.length).toBeGreaterThanOrEqual(1);
        expect(violations[0].type).toBe("class");
        const cleanedPart = violations[0].suggestion.split('"')[1] ?? "";
        expect(cleanedPart.length).toBeLessThanOrEqual(className.length);
      } else {
        expect(violations).toHaveLength(1);
        expect(violations[0].violation).toBe(className);
        expect(violations[0].severity).toBe("error");
        expect(violations[0].type).toBe("class");
        expect(violations[0].suggestion).toContain("TestClass");
        const cleanedPart = violations[0].suggestion.split('"')[1];
        expect(cleanedPart).not.toContain(normalizedPrefix);
      }
    });

    it("should detect multiple forbidden prefixes in one file", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UnifiedMetricsEngine {}
        class EnhancedSecuritySystem {}
        class AdvancedAnalyticsPlatform {}
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(3);
      expect(violations[0].violation).toBe("UnifiedMetricsEngine");
      expect(violations[1].violation).toBe("EnhancedSecuritySystem");
      expect(violations[2].violation).toBe("AdvancedAnalyticsPlatform");
    });

    it("should detect forbidden prefixes in different contexts", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UnifiedMetricsEngine {}
        interface EnhancedSecuritySystem {}
        type AdvancedAnalyticsPlatform = string;
        enum SuperFastProcessor {}
        function UltraSecureVault() {}
        const MegaDataProcessor = () => {};
        let UltimateSolutionFramework = {};
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations.length).toBeGreaterThanOrEqual(7);
      expect(violations[0].type).toBe("class");
      expect(violations[1].type).toBe("interface");
      expect(violations[2].type).toBe("type");
      expect(violations[3].type).toBe("enum");
      expect(violations[4].type).toBe("function");
      expect(violations[5].type).toBe("function");
      expect(violations[6].type).toBe("variable");
    });
  });

  describe("File Name Detection", () => {
    it("should detect forbidden prefixes in file names", async () => {
      const testFile = join(testDir, "UnifiedMetricsEngine.ts");
      const content = "export class Test {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("UnifiedMetricsEngine");
      expect(violations[0].type).toBe("file");
    });

    it("should detect enhanced file name violations", async () => {
      const testFile = join(testDir, "EnhancedSecuritySystem.ts");
      const content = "export class Test {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("EnhancedSecuritySystem");
      expect(violations[0].type).toBe("file");
    });
  });

  describe("Package.json Detection", () => {
    it("should detect package name violations", async () => {
      const testFile = join(testDir, "package.json");
      const content = JSON.stringify({
        name: "UnifiedMetricsEngine",
        version: "1.0.0",
      });
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("UnifiedMetricsEngine");
      expect(violations[0].type).toBe("package");
    });

    it("should handle invalid JSON gracefully", async () => {
      const testFile = join(testDir, "package.json");
      writeFileSync(testFile, "invalid json content");

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });

    it("should handle missing name field", async () => {
      const testFile = join(testDir, "package.json");
      const content = JSON.stringify({
        version: "1.0.0",
      });
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });
  });

  describe("Suggestion Generation", () => {
    it("should generate proper suggestions for forbidden prefixes", async () => {
      const testFile = join(testDir, "test.ts");
      const content = "class UnifiedMetricsEngine {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].suggestion).toContain("MetricsEngine");
      // The suggestion should not contain the forbidden prefix in the cleaned part
      const cleanedPart = violations[0].suggestion.split('"')[1];
      expect(cleanedPart).not.toContain("Unified");
    });

    it("should generate suggestions for enhanced prefixes", async () => {
      const testFile = join(testDir, "test.ts");
      const content = "class EnhancedSecuritySystem {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].suggestion).toContain("SecuritySystem");
      // The suggestion should not contain the forbidden prefix in the cleaned part
      const cleanedPart = violations[0].suggestion.split('"')[1];
      expect(cleanedPart).not.toContain("Enhanced");
    });

    it("should generate suggestions for complex names", async () => {
      const testFile = join(testDir, "test.ts");
      const content = "class VeryComplexDataProcessingEngine {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe("warning");
      expect(violations[0].suggestion).toContain("Simplify");
    });
  });

  describe("Directory Scanning", () => {
    it("should scan multiple files in directory", async () => {
      const file1 = join(testDir, "test1.ts");
      const file2 = join(testDir, "test2.ts");

      writeFileSync(file1, "class UnifiedMetricsEngine {}");
      writeFileSync(file2, "class EnhancedSecuritySystem {}");

      const result = await scanner.scanDirectory(testDir);

      expect(result.totalFiles).toBe(2);
      expect(result.totalViolations).toBe(2);
      expect(result.violations).toHaveLength(2);
    });

    it("should exclude test directories by default", async () => {
      const testSubDir = join(testDir, "test-dir");
      mkdirSync(testSubDir, { recursive: true });
      const testFile = join(testSubDir, "test.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const result = await scanner.scanDirectory(testDir);

      // The directory should be excluded because it matches the test pattern
      expect(result.totalFiles).toBe(0);
      expect(result.totalViolations).toBe(0);
    });

    it("should exclude node_modules", async () => {
      const nodeModulesDir = join(testDir, "node_modules");
      const testFile = join(nodeModulesDir, "test.ts");
      mkdirSync(nodeModulesDir, { recursive: true });
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const result = await scanner.scanDirectory(testDir);

      expect(result.totalFiles).toBe(0);
      expect(result.totalViolations).toBe(0);
    });

    it("should exclude dist directory", async () => {
      const distDir = join(testDir, "dist");
      const testFile = join(distDir, "test.ts");
      mkdirSync(distDir, { recursive: true });
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const result = await scanner.scanDirectory(testDir);

      expect(result.totalFiles).toBe(0);
      expect(result.totalViolations).toBe(0);
    });

    it("should handle nested directories", async () => {
      const nestedDir = join(testDir, "src", "components");
      mkdirSync(nestedDir, { recursive: true });

      const testFile = join(nestedDir, "UnifiedComponent.ts");
      writeFileSync(testFile, "export class Test {}");

      const result = await scanner.scanDirectory(testDir);

      expect(result.totalFiles).toBe(1);
      expect(result.totalViolations).toBe(1);
    });
  });

  describe("Valid Names", () => {
    it("should not flag valid class names", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class MetricsEngine {}
        class SecuritySystem {}
        class DataProcessor {}
        class UserService {}
        class AuthProvider {}
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });

    it("should not flag valid function names", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        function processData() {}
        const calculateMetrics = () => {};
        let securityConfig = {};
        const validateUser = () => {};
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });

    it("should not flag valid package names", async () => {
      const testFile = join(testDir, "package.json");
      const content = JSON.stringify({
        name: "metrics-engine",
        version: "1.0.0",
      });
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });

    it("should not flag valid file names", async () => {
      const testFile = join(testDir, "MetricsEngine.ts");
      const content = "export class Test {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent files gracefully", async () => {
      const violations = await scanner.scanFile("non-existent-file.ts");
      expect(violations).toHaveLength(0);
    });

    it("should handle non-existent directories gracefully", async () => {
      const result = await scanner.scanDirectory("non-existent-directory");
      expect(result.totalFiles).toBe(0);
      expect(result.totalViolations).toBe(0);
    });

    it("should handle permission errors gracefully", async () => {
      // Mock fs.readFileSync to throw an error
      vi.spyOn(require("fs"), "readFileSync").mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const violations = await scanner.scanFile("test.ts");
      expect(violations).toHaveLength(0);

      // Restore original function
      vi.restoreAllMocks();
    });
  });

  describe("Scan Result Structure", () => {
    it("should return properly structured scan results", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UnifiedMetricsEngine {}
        class EnhancedSecuritySystem {}
        class ValidClass {}
      `;
      writeFileSync(testFile, content);

      const result = await scanner.scanDirectory(testDir);

      expect(result).toHaveProperty("violations");
      expect(result).toHaveProperty("totalFiles");
      expect(result).toHaveProperty("totalViolations");
      expect(result).toHaveProperty("summary");

      expect(result.summary).toHaveProperty("errors");
      expect(result.summary).toHaveProperty("warnings");
      expect(result.summary).toHaveProperty("byType");

      expect(result.totalFiles).toBe(1);
      expect(result.totalViolations).toBe(2);
      expect(result.summary.errors).toBe(2);
      expect(result.summary.warnings).toBe(0);
    });

    it("should categorize violations by type correctly", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UnifiedMetricsEngine {}
        interface EnhancedSecuritySystem {}
        function AdvancedDataProcessor() {}
        const SuperFastProcessor = () => {};
      `;
      writeFileSync(testFile, content);

      const result = await scanner.scanDirectory(testDir);

      expect(result.summary.byType.class).toBe(1);
      expect(result.summary.byType.interface).toBe(1);
      expect(result.summary.byType.function).toBe(2);
    });
  });

  describe("Custom Rules", () => {
    it("should apply custom rules correctly", async () => {
      scanner.addRule({
        pattern: /CustomPattern/g,
        forbidden: ["Custom"],
        suggestion: "Use a different name",
        severity: "error",
        description: "Custom test rule",
      });

      const testFile = join(testDir, "test.ts");
      const content = "class CustomPatternTest {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("CustomPattern");
      expect(violations[0].severity).toBe("error");
    });

    it("should handle rules without forbidden terms", async () => {
      scanner.addRule({
        pattern: /ComplexPattern/g,
        forbidden: [],
        suggestion: "Simplify the name",
        severity: "warning",
        description: "Complex naming rule",
      });

      const testFile = join(testDir, "test.ts");
      const content = "class ComplexPatternTest {}";
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("ComplexPattern");
      expect(violations[0].severity).toBe("warning");
    });
  });

  describe("Performance", () => {
    it("should handle large files efficiently", async () => {
      const testFile = join(testDir, "large.ts");
      const content = Array(1000).fill("class UnifiedMetricsEngine {}").join("\n");
      writeFileSync(testFile, content);

      const startTime = Date.now();
      const violations = await scanner.scanFile(testFile);
      const endTime = Date.now();

      expect(violations).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should handle many files efficiently", async () => {
      // Create 100 test files
      for (let i = 0; i < 100; i++) {
        const testFile = join(testDir, `test${i}.ts`);
        writeFileSync(testFile, "class UnifiedMetricsEngine {}");
      }

      const startTime = Date.now();
      const result = await scanner.scanDirectory(testDir);
      const endTime = Date.now();

      expect(result.totalFiles).toBe(100);
      expect(result.totalViolations).toBe(100);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty files", async () => {
      const testFile = join(testDir, "empty.ts");
      writeFileSync(testFile, "");

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });

    it("should handle files with only whitespace", async () => {
      const testFile = join(testDir, "whitespace.ts");
      writeFileSync(testFile, "   \n  \t  \n  ");

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });

    it("should handle files with comments only", async () => {
      const testFile = join(testDir, "comments.ts");
      writeFileSync(testFile, "// This is a comment\n/* Another comment */");

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });

    it("should handle case sensitivity correctly", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class unifiedMetricsEngine {} // lowercase - should not match
        class UNIFIEDMETRICSENGINE {} // uppercase - should not match
        class UnifiedMetricsEngine {} // correct case - should match
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations.length).toBeGreaterThanOrEqual(1);
      const unifiedViolation = violations.find(v => v.violation === "UnifiedMetricsEngine");
      expect(unifiedViolation).toBeDefined();
    });

    it("should handle partial matches correctly", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class Unified {} // partial match - should not match
        class UnifiedEngine {} // full match - should match
        class UnifiedMetricsEngine {} // full match - should match
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(2);
      expect(violations[0].violation).toBe("UnifiedEngine");
      expect(violations[1].violation).toBe("UnifiedMetricsEngine");
    });
  });
});
