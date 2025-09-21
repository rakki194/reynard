/**
 * Tests for MetricsCalculator JunkFile integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { MetricsCalculator } from "../MetricsCalculator";
import { CodeQualityMetrics } from "../types";

describe("MetricsCalculator - JunkFile Integration", () => {
  let calculator: MetricsCalculator;

  beforeEach(() => {
    calculator = new MetricsCalculator();
  });

  describe("updateMetricsWithJunkFiles", () => {
    it("should update metrics with junk file data", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = {
        totalJunkFiles: 5,
        criticalJunkFiles: 1,
        highJunkFiles: 2,
        qualityScore: 75,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result).toEqual({
        ...baseMetrics,
        // Junk file metrics should be added
        junkFiles: 5,
        criticalJunkFiles: 1,
        highJunkFiles: 2,
        junkFileQualityScore: 75,
      });
    });

    it("should handle zero junk files", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = {
        totalJunkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        qualityScore: 100,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result).toEqual({
        ...baseMetrics,
        junkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        junkFileQualityScore: 100,
      });
    });

    it("should handle high junk file counts", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = {
        totalJunkFiles: 50,
        criticalJunkFiles: 10,
        highJunkFiles: 20,
        qualityScore: 25,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result).toEqual({
        ...baseMetrics,
        junkFiles: 50,
        criticalJunkFiles: 10,
        highJunkFiles: 20,
        junkFileQualityScore: 25,
      });
    });

    it("should preserve existing metrics properties", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 2000,
        linesOfComments: 200,
        cyclomaticComplexity: 20,
        cognitiveComplexity: 25,
        maintainabilityIndex: 70,
        codeSmells: 10,
        bugs: 5,
        vulnerabilities: 3,
        securityHotspots: 2,
        duplications: 5,
        lineCoverage: 70,
        branchCoverage: 65,
        functionCoverage: 75,
        docstringCoverage: 60,
        docstringQualityScore: 65,
        documentedFunctions: 15,
        totalFunctions: 20,
        documentedClasses: 8,
        totalClasses: 10,
        documentedModules: 5,
        totalModules: 8,
        technicalDebt: 300,
        reliabilityRating: "B",
        securityRating: "C",
        maintainabilityRating: "B",
      };

      const junkFileMetrics = {
        totalJunkFiles: 3,
        criticalJunkFiles: 0,
        highJunkFiles: 1,
        qualityScore: 90,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      // Verify all original properties are preserved
      expect(result.linesOfCode).toBe(2000);
      expect(result.linesOfComments).toBe(200);
      expect(result.cyclomaticComplexity).toBe(20);
      expect(result.cognitiveComplexity).toBe(25);
      expect(result.maintainabilityIndex).toBe(70);
      expect(result.codeSmells).toBe(10);
      expect(result.bugs).toBe(5);
      expect(result.vulnerabilities).toBe(3);
      expect(result.securityHotspots).toBe(2);
      expect(result.duplications).toBe(5);
      expect(result.lineCoverage).toBe(70);
      expect(result.branchCoverage).toBe(65);
      expect(result.functionCoverage).toBe(75);
      expect(result.docstringCoverage).toBe(60);
      expect(result.docstringQualityScore).toBe(65);
      expect(result.documentedFunctions).toBe(15);
      expect(result.totalFunctions).toBe(20);
      expect(result.documentedClasses).toBe(8);
      expect(result.totalClasses).toBe(10);
      expect(result.documentedModules).toBe(5);
      expect(result.totalModules).toBe(8);
      expect(result.technicalDebt).toBe(300);
      expect(result.reliabilityRating).toBe("B");
      expect(result.securityRating).toBe("C");
      expect(result.maintainabilityRating).toBe("B");

      // Verify junk file properties are added
      expect(result.junkFiles).toBe(3);
      expect(result.criticalJunkFiles).toBe(0);
      expect(result.highJunkFiles).toBe(1);
      expect(result.junkFileQualityScore).toBe(90);
    });

    it("should handle undefined junk file metrics", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = {
        totalJunkFiles: undefined as any,
        criticalJunkFiles: undefined as any,
        highJunkFiles: undefined as any,
        qualityScore: undefined as any,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result).toEqual({
        ...baseMetrics,
        junkFiles: undefined,
        criticalJunkFiles: undefined,
        highJunkFiles: undefined,
        junkFileQualityScore: undefined,
      });
    });

    it("should handle negative junk file counts", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = {
        totalJunkFiles: -1,
        criticalJunkFiles: -2,
        highJunkFiles: -3,
        qualityScore: -10,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result).toEqual({
        ...baseMetrics,
        junkFiles: -1,
        criticalJunkFiles: -2,
        highJunkFiles: -3,
        junkFileQualityScore: -10,
      });
    });

    it("should handle very high quality scores", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = {
        totalJunkFiles: 0,
        criticalJunkFiles: 0,
        highJunkFiles: 0,
        qualityScore: 100,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result.junkFileQualityScore).toBe(100);
    });

    it("should handle very low quality scores", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = {
        totalJunkFiles: 100,
        criticalJunkFiles: 50,
        highJunkFiles: 30,
        qualityScore: 0,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result.junkFileQualityScore).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty base metrics", () => {
      const baseMetrics = {} as CodeQualityMetrics;
      const junkFileMetrics = {
        totalJunkFiles: 1,
        criticalJunkFiles: 0,
        highJunkFiles: 1,
        qualityScore: 50,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result).toEqual({
        ...baseMetrics,
        junkFiles: 1,
        criticalJunkFiles: 0,
        highJunkFiles: 1,
        junkFileQualityScore: 50,
      });
    });

    it("should handle null base metrics", () => {
      const baseMetrics = null as any;
      const junkFileMetrics = {
        totalJunkFiles: 1,
        criticalJunkFiles: 0,
        highJunkFiles: 1,
        qualityScore: 50,
      };

      const result = calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);

      expect(result).toEqual({
        junkFiles: 1,
        criticalJunkFiles: 0,
        highJunkFiles: 1,
        junkFileQualityScore: 50,
      });
    });

    it("should handle null junk file metrics", () => {
      const baseMetrics: CodeQualityMetrics = {
        linesOfCode: 1000,
        linesOfComments: 100,
        cyclomaticComplexity: 10,
        cognitiveComplexity: 15,
        maintainabilityIndex: 80,
        codeSmells: 5,
        bugs: 2,
        vulnerabilities: 1,
        securityHotspots: 0,
        duplications: 0,
        lineCoverage: 85,
        branchCoverage: 80,
        functionCoverage: 90,
        docstringCoverage: 75,
        docstringQualityScore: 80,
        documentedFunctions: 8,
        totalFunctions: 10,
        documentedClasses: 3,
        totalClasses: 5,
        documentedModules: 2,
        totalModules: 3,
        technicalDebt: 120,
        reliabilityRating: "A",
        securityRating: "B",
        maintainabilityRating: "A",
      };

      const junkFileMetrics = null as any;

      // The method should throw an error when junkFileMetrics is null
      expect(() => {
        calculator.updateMetricsWithJunkFiles(baseMetrics, junkFileMetrics);
      }).toThrow();
    });
  });
});
