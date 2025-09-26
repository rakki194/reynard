/**
 * 🦊 Naming Violation Scanner Tests
 *
 * Comprehensive test suite for the naming violation scanner.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { NamingViolationScanner, type NamingViolation } from "../NamingViolationScanner";

describe("NamingViolationScanner", () => {
  let scanner: NamingViolationScanner;
  let testDir: string;

  beforeEach(() => {
    scanner = new NamingViolationScanner();
    testDir = join(process.cwd(), "test-naming-violations");
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("Forbidden Prefix Detection", () => {
    it("should detect Unified prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UnifiedMetricsEngine {
          constructor() {}
        }
        
        interface UnifiedDataProcessor {
          process(): void;
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(2);
      expect(violations[0].violation).toBe("UnifiedMetricsEngine");
      expect(violations[0].severity).toBe("error");
      expect(violations[0].type).toBe("class");
      expect(violations[1].violation).toBe("UnifiedDataProcessor");
      expect(violations[1].type).toBe("interface");
    });

    it("should detect Enhanced prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class EnhancedSecuritySystem {
          process(): void {}
        }
        
        const EnhancedDataProcessor = () => {};
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(2);
      expect(violations[0].violation).toBe("EnhancedSecuritySystem");
      expect(violations[1].violation).toBe("EnhancedDataProcessor");
    });

    it("should detect Advanced prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class AdvancedAnalyticsEngine {
          analyze(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("AdvancedAnalyticsEngine");
    });

    it("should detect Super prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class SuperFastProcessor {
          process(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("SuperFastProcessor");
    });

    it("should detect Ultra prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UltraSecureVault {
          secure(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("UltraSecureVault");
    });

    it("should detect Mega prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class MegaDataProcessor {
          process(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("MegaDataProcessor");
    });

    it("should detect Ultimate prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UltimateSolutionFramework {
          solve(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("UltimateSolutionFramework");
    });

    it("should detect Comprehensive prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class ComprehensiveAnalysisSystem {
          analyze(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("ComprehensiveAnalysisSystem");
    });

    it("should detect Complete prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class CompleteDataManagementSystem {
          manage(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("CompleteDataManagementSystem");
    });

    it("should detect Full-Featured prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class Full-FeaturedAnalyticsPlatform {
          analyze(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("Full-FeaturedAnalyticsPlatform");
    });

    it("should detect Enterprise-Grade prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class Enterprise-GradeSecurityFramework {
          secure(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("Enterprise-GradeSecurityFramework");
    });

    it("should detect Intelligent prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class IntelligentDataProcessor {
          process(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("IntelligentDataProcessor");
    });

    it("should detect Smart prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class SmartAnalyticsEngine {
          analyze(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("SmartAnalyticsEngine");
    });

    it("should detect AI-Powered prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class AI-PoweredDataProcessor {
          process(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("AI-PoweredDataProcessor");
    });

    it("should detect Next-Gen prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class Next-GenAnalyticsPlatform {
          analyze(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("Next-GenAnalyticsPlatform");
    });

    it("should detect Revolutionary prefix violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class RevolutionaryDataFramework {
          process(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("RevolutionaryDataFramework");
    });
  });

  describe("Function and Variable Detection", () => {
    it("should detect function violations", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        function EnhancedDataProcessor() {
          return {};
        }
        
        const UnifiedMetricsEngine = () => {};
        
        let AdvancedAnalyticsSystem = {};
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(3);
      expect(violations[0].violation).toBe("EnhancedDataProcessor");
      expect(violations[0].type).toBe("function");
      expect(violations[1].violation).toBe("UnifiedMetricsEngine");
      expect(violations[1].type).toBe("function");
      expect(violations[2].violation).toBe("AdvancedAnalyticsSystem");
      expect(violations[2].type).toBe("variable");
    });
  });

  describe("Package.json Detection", () => {
    it("should detect package name violations", async () => {
      const testFile = join(testDir, "package.json");
      const content = JSON.stringify({
        name: "unified-metrics-engine",
        version: "1.0.0",
      });
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("unified-metrics-engine");
      expect(violations[0].type).toBe("package");
    });

    it("should detect enhanced package name violations", async () => {
      const testFile = join(testDir, "package.json");
      const content = JSON.stringify({
        name: "enhanced-security-framework",
        version: "1.0.0",
      });
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].violation).toBe("enhanced-security-framework");
    });
  });

  describe("File Name Detection", () => {
    it("should detect file name violations", async () => {
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
    });
  });

  describe("Suggestion Generation", () => {
    it("should generate proper suggestions for forbidden prefixes", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class UnifiedMetricsEngine {
          process(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].suggestion).toContain("MetricsEngine");
      expect(violations[0].suggestion).not.toContain("Unified");
    });

    it("should generate suggestions for enhanced prefixes", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class EnhancedSecuritySystem {
          secure(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(1);
      expect(violations[0].suggestion).toContain("SecuritySystem");
      expect(violations[0].suggestion).not.toContain("Enhanced");
    });
  });

  describe("Directory Scanning", () => {
    it("should scan multiple files in directory", async () => {
      // Create multiple test files
      const file1 = join(testDir, "test1.ts");
      const file2 = join(testDir, "test2.ts");

      writeFileSync(file1, "class UnifiedMetricsEngine {}");
      writeFileSync(file2, "class EnhancedSecuritySystem {}");

      const result = await scanner.scanDirectory(testDir);

      expect(result.totalFiles).toBe(2);
      expect(result.totalViolations).toBe(2);
      expect(result.violations).toHaveLength(2);
    });

    it("should exclude test files by default", async () => {
      const testFile = join(testDir, "test-file.ts");
      writeFileSync(testFile, "class UnifiedMetricsEngine {}");

      const result = await scanner.scanDirectory(testDir);

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
  });

  describe("Valid Names", () => {
    it("should not flag valid class names", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        class MetricsEngine {
          process(): void {}
        }
        
        class SecuritySystem {
          secure(): void {}
        }
        
        class DataProcessor {
          process(): void {}
        }
      `;
      writeFileSync(testFile, content);

      const violations = await scanner.scanFile(testFile);

      expect(violations).toHaveLength(0);
    });

    it("should not flag valid function names", async () => {
      const testFile = join(testDir, "test.ts");
      const content = `
        function processData() {
          return {};
        }
        
        const calculateMetrics = () => {};
        
        let securityConfig = {};
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
  });

  describe("Custom Rules", () => {
    it("should allow adding custom rules", () => {
      const initialRules = scanner.getRules().length;

      scanner.addRule({
        pattern: /TestPattern/g,
        forbidden: ["Test"],
        suggestion: "Use a different name",
        severity: "warning",
        description: "Custom test rule",
      });

      expect(scanner.getRules()).toHaveLength(initialRules + 1);
    });

    it("should clear all rules", () => {
      scanner.clearRules();
      expect(scanner.getRules()).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent files gracefully", async () => {
      const violations = await scanner.scanFile("non-existent-file.ts");
      expect(violations).toHaveLength(0);
    });

    it("should handle invalid JSON in package.json", async () => {
      const testFile = join(testDir, "package.json");
      writeFileSync(testFile, "invalid json content");

      const violations = await scanner.scanFile(testFile);
      expect(violations).toHaveLength(0);
    });
  });
});
