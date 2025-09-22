/**
 * Tests for MetricsCalculator with docstring metrics integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { MetricsCalculator } from "../MetricsCalculator";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Mock the DocstringAnalyzer
vi.mock("../DocstringAnalyzer", () => ({
  DocstringAnalyzer: vi.fn().mockImplementation(() => ({
    analyzeFiles: vi.fn().mockResolvedValue([]),
    getOverallMetrics: vi.fn().mockReturnValue({
      totalFunctions: 10,
      documentedFunctions: 8,
      totalClasses: 5,
      documentedClasses: 4,
      totalModules: 3,
      documentedModules: 3,
      coveragePercentage: 80,
      averageDocstringLength: 25,
      qualityScore: 85,
    }),
  })),
}));

describe("MetricsCalculator", () => {
  let calculator: MetricsCalculator;
  let tempDir: string;

  beforeEach(() => {
    calculator = new MetricsCalculator();
    tempDir = join(process.cwd(), "temp-test-files");

    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
  });

  describe("Docstring Metrics Integration", () => {
    it("should include docstring metrics in overall metrics", async () => {
      const pythonContent = `"""
Well documented module.
"""

def documented_function():
    """
    Well documented function.
    """
    return "documented"

def undocumented_function():
    return "no docstring"

class DocumentedClass:
    """
    Well documented class.
    """
    pass
`;

      const tempFile = join(tempDir, "test_metrics.py");
      writeFileSync(tempFile, pythonContent);

      const languageAnalyses = [
        {
          language: "python",
          files: 1,
          lines: 20,
          issues: 0,
          coverage: 0,
        },
      ];

      const metrics = await calculator.calculateMetrics([tempFile], languageAnalyses);

      // Check that docstring metrics are included
      expect(metrics).toHaveProperty("docstringCoverage");
      expect(metrics).toHaveProperty("docstringQualityScore");
      expect(metrics).toHaveProperty("documentedFunctions");
      expect(metrics).toHaveProperty("totalFunctions");
      expect(metrics).toHaveProperty("documentedClasses");
      expect(metrics).toHaveProperty("totalClasses");
      expect(metrics).toHaveProperty("documentedModules");
      expect(metrics).toHaveProperty("totalModules");

      // Values should be numbers
      expect(typeof metrics.docstringCoverage).toBe("number");
      expect(typeof metrics.docstringQualityScore).toBe("number");
      expect(typeof metrics.documentedFunctions).toBe("number");
      expect(typeof metrics.totalFunctions).toBe("number");

      // Clean up
      if (existsSync(tempFile)) unlinkSync(tempFile);
    });

    it("should handle files with no docstring content", async () => {
      const nonDocstringFiles = [join(tempDir, "test.txt"), join(tempDir, "test.json")];

      writeFileSync(nonDocstringFiles[0], "This is a text file");
      writeFileSync(nonDocstringFiles[1], '{"key": "value"}');

      const languageAnalyses = [
        {
          language: "text",
          files: 2,
          lines: 2,
          issues: 0,
          coverage: 0,
        },
      ];

      const metrics = await calculator.calculateMetrics(nonDocstringFiles, languageAnalyses);

      // Should have default values for non-docstring files
      expect(metrics.docstringCoverage).toBe(100); // Default for no files
      expect(metrics.docstringQualityScore).toBe(100); // Default for no files
      expect(metrics.documentedFunctions).toBe(0);
      expect(metrics.totalFunctions).toBe(0);
      expect(metrics.documentedClasses).toBe(0);
      expect(metrics.totalClasses).toBe(0);
      expect(metrics.documentedModules).toBe(0);
      expect(metrics.totalModules).toBe(0);

      // Clean up
      nonDocstringFiles.forEach(file => {
        if (existsSync(file)) unlinkSync(file);
      });
    });

    it("should handle mixed file types correctly", async () => {
      const pythonContent = `def documented_function():
    """
    Well documented function.
    """
    return "documented"
`;

      const tsContent = `/**
 * Well documented function.
 */
export function documentedFunction(): string {
  return "documented";
}
`;

      const otherContent = "This is a text file";

      const pythonFile = join(tempDir, "test_mixed.py");
      const tsFile = join(tempDir, "test_mixed.ts");
      const otherFile = join(tempDir, "test_mixed.txt");

      writeFileSync(pythonFile, pythonContent);
      writeFileSync(tsFile, tsContent);
      writeFileSync(otherFile, otherContent);

      const languageAnalyses = [
        {
          language: "python",
          files: 1,
          lines: 10,
          issues: 0,
          coverage: 0,
        },
        {
          language: "typescript",
          files: 1,
          lines: 10,
          issues: 0,
          coverage: 0,
        },
        {
          language: "text",
          files: 1,
          lines: 1,
          issues: 0,
          coverage: 0,
        },
      ];

      const allFiles = [pythonFile, tsFile, otherFile];
      const metrics = await calculator.calculateMetrics(allFiles, languageAnalyses);

      // Should include metrics from Python and TypeScript files
      expect(metrics.totalFunctions).toBeGreaterThan(0);
      expect(metrics.documentedFunctions).toBeGreaterThan(0);
      expect(metrics.docstringCoverage).toBeGreaterThan(0);
      expect(metrics.docstringQualityScore).toBeGreaterThan(0);

      // Clean up
      [pythonFile, tsFile, otherFile].forEach(file => {
        if (existsSync(file)) unlinkSync(file);
      });
    });
  });

  describe("Metrics Calculation", () => {
    it("should calculate maintainability rating correctly", () => {
      const testMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 50,
        cognitiveComplexity: 60,
        maintainabilityIndex: 85,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 80,
        branchCoverage: 75,
        functionCoverage: 85,
        docstringCoverage: 90,
        docstringQualityScore: 85,
        documentedFunctions: 18,
        totalFunctions: 20,
        documentedClasses: 8,
        totalClasses: 10,
        documentedModules: 5,
        totalModules: 5,
        technicalDebt: 120,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
        junkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        junkFileQualityScore: 100,
      };

      const rating = calculator.calculateMaintainabilityRating(testMetrics);
      expect(rating).toBe("A");
    });

    it("should calculate reliability rating correctly", () => {
      const testMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 50,
        cognitiveComplexity: 60,
        maintainabilityIndex: 85,
        codeSmells: 5,
        bugs: 0, // No bugs
        vulnerabilities: 0,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 80,
        branchCoverage: 75,
        functionCoverage: 85,
        docstringCoverage: 90,
        docstringQualityScore: 85,
        documentedFunctions: 18,
        totalFunctions: 20,
        documentedClasses: 8,
        totalClasses: 10,
        documentedModules: 5,
        totalModules: 5,
        technicalDebt: 120,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
        junkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        junkFileQualityScore: 100,
      };

      const rating = calculator.calculateReliabilityRating(testMetrics);
      expect(rating).toBe("A");
    });

    it("should calculate security rating correctly", () => {
      const testMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 50,
        cognitiveComplexity: 60,
        maintainabilityIndex: 85,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 0, // No vulnerabilities
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 80,
        branchCoverage: 75,
        functionCoverage: 85,
        docstringCoverage: 90,
        docstringQualityScore: 85,
        documentedFunctions: 18,
        totalFunctions: 20,
        documentedClasses: 8,
        totalClasses: 10,
        documentedModules: 5,
        totalModules: 5,
        technicalDebt: 120,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
        junkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        junkFileQualityScore: 100,
      };

      const rating = calculator.calculateSecurityRating(testMetrics);
      expect(rating).toBe("A");
    });
  });

  describe("Issue Integration", () => {
    it("should update metrics with issue data including docstring issues", () => {
      const baseMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 50,
        cognitiveComplexity: 60,
        maintainabilityIndex: 85,
        codeSmells: 0,
        bugs: 0,
        vulnerabilities: 0,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 80,
        branchCoverage: 75,
        functionCoverage: 85,
        docstringCoverage: 90,
        docstringQualityScore: 85,
        documentedFunctions: 18,
        totalFunctions: 20,
        documentedClasses: 8,
        totalClasses: 10,
        documentedModules: 5,
        totalModules: 5,
        technicalDebt: 0,
        reliabilityRating: "A" as const,
        securityRating: "A" as const,
        maintainabilityRating: "A" as const,
        junkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        junkFileQualityScore: 100,
      };

      const issues = [
        { type: "CODE_SMELL", severity: "MAJOR", effort: 30 },
        { type: "BUG", severity: "CRITICAL", effort: 60 },
        { type: "VULNERABILITY", severity: "BLOCKER", effort: 120 },
        { type: "SECURITY_HOTSPOT", severity: "HIGH", effort: 45 },
      ];

      const updatedMetrics = calculator.updateMetricsWithIssues(baseMetrics, issues);

      expect(updatedMetrics.codeSmells).toBe(1);
      expect(updatedMetrics.bugs).toBe(1);
      expect(updatedMetrics.vulnerabilities).toBe(1);
      expect(updatedMetrics.securityHotspots).toBe(1);
      expect(updatedMetrics.technicalDebt).toBe(255); // Sum of all efforts

      // Docstring metrics should remain unchanged
      expect(updatedMetrics.docstringCoverage).toBe(90);
      expect(updatedMetrics.docstringQualityScore).toBe(85);
    });
  });

  describe("Error Handling", () => {
    it("should handle docstring analysis errors gracefully", async () => {
      // Mock the DocstringAnalyzer to throw an error
      const mockAnalyzer = calculator["docstringAnalyzer"];
      mockAnalyzer.analyzeFiles = vi.fn().mockRejectedValue(new Error("Analysis failed"));

      const languageAnalyses = [
        {
          language: "python",
          files: 1,
          lines: 10,
          issues: 0,
          coverage: 0,
        },
      ];

      const metrics = await calculator.calculateMetrics(["test.py"], languageAnalyses);

      // Should return default values when analysis fails
      expect(metrics.docstringCoverage).toBe(0);
      expect(metrics.docstringQualityScore).toBe(0);
      expect(metrics.documentedFunctions).toBe(0);
      expect(metrics.totalFunctions).toBe(0);
    });

    it("should handle empty file arrays", async () => {
      const languageAnalyses: any[] = [];
      const metrics = await calculator.calculateMetrics([], languageAnalyses);

      expect(metrics.linesOfCode).toBe(0);
      expect(metrics.linesOfComments).toBe(0);
      expect(metrics.cyclomaticComplexity).toBe(0);
      expect(metrics.docstringCoverage).toBe(100); // Default for no files
      expect(metrics.docstringQualityScore).toBe(100); // Default for no files
    });
  });
});
