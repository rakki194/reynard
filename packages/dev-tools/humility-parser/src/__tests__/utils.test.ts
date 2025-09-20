/**
 * Tests for utility functions
 */

import { describe, it, expect } from "vitest";
import {
  severityToNumber,
  confidenceToNumber,
  numberToSeverity,
  numberToConfidence,
  formatHumilityScore,
  formatSeverity,
  formatConfidence,
  getCategoryDescription,
  getCategorySuggestions,
  calculateImprovementScore,
  generateImprovementRecommendations,
  validateReportFilePath,
  extractFileName,
  formatFilePath,
} from "../utils";
import { SeverityLevel, ConfidenceLevel, DetectionCategory } from "../types";

describe("Utility Functions", () => {
  describe("severityToNumber", () => {
    it("should convert severity levels to numbers", () => {
      expect(severityToNumber(SeverityLevel.LOW)).toBe(1);
      expect(severityToNumber(SeverityLevel.MEDIUM)).toBe(2);
      expect(severityToNumber(SeverityLevel.HIGH)).toBe(3);
      expect(severityToNumber(SeverityLevel.CRITICAL)).toBe(4);
    });
  });

  describe("confidenceToNumber", () => {
    it("should convert confidence levels to numbers", () => {
      expect(confidenceToNumber(ConfidenceLevel.LOW)).toBe(1);
      expect(confidenceToNumber(ConfidenceLevel.MEDIUM)).toBe(2);
      expect(confidenceToNumber(ConfidenceLevel.HIGH)).toBe(3);
      expect(confidenceToNumber(ConfidenceLevel.VERY_HIGH)).toBe(4);
    });
  });

  describe("numberToSeverity", () => {
    it("should convert numbers to severity levels", () => {
      expect(numberToSeverity(1)).toBe(SeverityLevel.LOW);
      expect(numberToSeverity(2)).toBe(SeverityLevel.MEDIUM);
      expect(numberToSeverity(3)).toBe(SeverityLevel.HIGH);
      expect(numberToSeverity(4)).toBe(SeverityLevel.CRITICAL);
      expect(numberToSeverity(5)).toBe(SeverityLevel.CRITICAL);
    });
  });

  describe("numberToConfidence", () => {
    it("should convert numbers to confidence levels", () => {
      expect(numberToConfidence(1)).toBe(ConfidenceLevel.LOW);
      expect(numberToConfidence(2)).toBe(ConfidenceLevel.MEDIUM);
      expect(numberToConfidence(3)).toBe(ConfidenceLevel.HIGH);
      expect(numberToConfidence(4)).toBe(ConfidenceLevel.VERY_HIGH);
      expect(numberToConfidence(5)).toBe(ConfidenceLevel.VERY_HIGH);
    });
  });

  describe("formatHumilityScore", () => {
    it("should format excellent scores", () => {
      expect(formatHumilityScore(95)).toContain("🟢");
      expect(formatHumilityScore(95)).toContain("Excellent");
    });

    it("should format good scores", () => {
      expect(formatHumilityScore(85)).toContain("🟡");
      expect(formatHumilityScore(85)).toContain("Good");
    });

    it("should format fair scores", () => {
      expect(formatHumilityScore(75)).toContain("🟠");
      expect(formatHumilityScore(75)).toContain("Fair");
    });

    it("should format poor scores", () => {
      expect(formatHumilityScore(65)).toContain("🔴");
      expect(formatHumilityScore(65)).toContain("Poor");
    });

    it("should format critical scores", () => {
      expect(formatHumilityScore(45)).toContain("⚫");
      expect(formatHumilityScore(45)).toContain("Critical");
    });
  });

  describe("formatSeverity", () => {
    it("should format severity with emojis", () => {
      expect(formatSeverity(SeverityLevel.LOW)).toContain("🟢");
      expect(formatSeverity(SeverityLevel.MEDIUM)).toContain("🟡");
      expect(formatSeverity(SeverityLevel.HIGH)).toContain("🟠");
      expect(formatSeverity(SeverityLevel.CRITICAL)).toContain("🔴");
    });
  });

  describe("formatConfidence", () => {
    it("should format confidence with emojis", () => {
      expect(formatConfidence(ConfidenceLevel.LOW)).toContain("🔵");
      expect(formatConfidence(ConfidenceLevel.MEDIUM)).toContain("🟡");
      expect(formatConfidence(ConfidenceLevel.HIGH)).toContain("🟠");
      expect(formatConfidence(ConfidenceLevel.VERY_HIGH)).toContain("🔴");
    });
  });

  describe("getCategoryDescription", () => {
    it("should return descriptions for all categories", () => {
      expect(getCategoryDescription(DetectionCategory.SUPERLATIVES)).toContain("superlative");
      expect(getCategoryDescription(DetectionCategory.EXAGGERATION)).toContain("Exaggerated");
      expect(getCategoryDescription(DetectionCategory.SELF_PROMOTION)).toContain("Self-promotional");
      expect(getCategoryDescription(DetectionCategory.DISMISSIVENESS)).toContain("Dismissive");
      expect(getCategoryDescription(DetectionCategory.ABSOLUTE_CLAIMS)).toContain("Absolute");
      expect(getCategoryDescription(DetectionCategory.HYPE_LANGUAGE)).toContain("Hype");
    });
  });

  describe("getCategorySuggestions", () => {
    it("should return suggestions for all categories", () => {
      const suggestions = getCategorySuggestions(DetectionCategory.SUPERLATIVES);
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toContain("moderate language");
    });
  });

  describe("calculateImprovementScore", () => {
    it("should calculate improvement correctly", () => {
      const result = calculateImprovementScore(50, 75);
      expect(result.improvement).toBe(25);
      expect(result.percentage).toBe(50);
      expect(result.direction).toBe("improved");
    });

    it("should calculate decline correctly", () => {
      const result = calculateImprovementScore(75, 50);
      expect(result.improvement).toBe(-25);
      expect(result.percentage).toBeCloseTo(-33.333333333333336, 10);
      expect(result.direction).toBe("declined");
    });

    it("should handle unchanged scores", () => {
      const result = calculateImprovementScore(50, 50);
      expect(result.improvement).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.direction).toBe("unchanged");
    });
  });

  describe("generateImprovementRecommendations", () => {
    it("should generate recommendations based on findings", () => {
      const findings = [
        { category: DetectionCategory.SUPERLATIVES, severity: SeverityLevel.HIGH, count: 5 },
        { category: DetectionCategory.DISMISSIVENESS, severity: SeverityLevel.MEDIUM, count: 3 },
      ];

      const recommendations = generateImprovementRecommendations(findings);
      expect(recommendations).toHaveLength(5); // 2 specific + 3 general
      expect(recommendations[0]).toContain("superlatives");
    });
  });

  describe("validateReportFilePath", () => {
    it("should validate correct file paths", () => {
      expect(validateReportFilePath("report.json")).toBe(true);
      expect(validateReportFilePath("/path/to/report.json")).toBe(true);
    });

    it("should reject invalid file paths", () => {
      expect(validateReportFilePath("report.txt")).toBe(false);
      expect(validateReportFilePath("")).toBe(false);
    });
  });

  describe("extractFileName", () => {
    it("should extract file name from path", () => {
      expect(extractFileName("/path/to/report.json")).toBe("report.json");
      expect(extractFileName("report.json")).toBe("report.json");
    });
  });

  describe("formatFilePath", () => {
    it("should return short paths unchanged", () => {
      const shortPath = "short/path.json";
      expect(formatFilePath(shortPath)).toBe(shortPath);
    });

    it("should truncate long paths", () => {
      const longPath = "/very/long/path/to/some/report/file.json";
      const formatted = formatFilePath(longPath, 20);
      expect(formatted.length).toBeLessThanOrEqual(21); // Allow for rounding
      expect(formatted).toContain("file.json");
    });
  });
});
