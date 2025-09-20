/**
 * Integration tests for HumilityParser with real data
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { HumilityParser } from "../parser";
import { SeverityLevel, DetectionCategory } from "../types";

describe("HumilityParser Integration Tests", () => {
  const parser = new HumilityParser();
  const realReportPath = "/home/kade/runeset/reynard/scripts/humility/core_humility_report.json";

  describe("Real Data Integration", () => {
    it("should parse real humility detector output", () => {
      if (!existsSync(realReportPath)) {
        console.log("⚠️  Real report file not found, skipping integration test");
        return;
      }

      const report = parser.parseFromFile(realReportPath);

      // Verify basic structure
      expect(report.summary).toBeDefined();
      expect(report.summary.total_files).toBeGreaterThan(0);
      expect(report.summary.total_findings).toBeGreaterThan(0);
      expect(report.summary.average_score).toBeGreaterThan(0);

      // Verify metadata
      expect(report.metadata.parser_version).toBe("1.0.0");
      expect(report.metadata.parsed_at).toBeDefined();
      expect(report.metadata.source_file).toBe(realReportPath);

      // Verify profiles structure
      expect(report.profiles).toBeDefined();
      expect(Object.keys(report.profiles).length).toBeGreaterThan(0);
    });

    it("should handle real data filtering", () => {
      if (!existsSync(realReportPath)) {
        console.log("⚠️  Real report file not found, skipping integration test");
        return;
      }

      const report = parser.parseFromFile(realReportPath);

      // Test filtering by severity
      const highSeverityReport = parser.filterReport(report, {
        minSeverity: SeverityLevel.HIGH,
      });

      expect(highSeverityReport.filtered_summary.filtered_findings).toBeLessThanOrEqual(report.summary.total_findings);
      expect(highSeverityReport.filtered_summary.filtered_files).toBeLessThanOrEqual(report.summary.total_files);

      // Test filtering by categories
      const boastfulReport = parser.filterReport(report, {
        categories: [DetectionCategory.SUPERLATIVES, DetectionCategory.SELF_PROMOTION],
      });

      expect(boastfulReport.filtered_summary.filtered_findings).toBeLessThanOrEqual(report.summary.total_findings);
    });

    it("should provide meaningful analysis of real data", () => {
      if (!existsSync(realReportPath)) {
        console.log("⚠️  Real report file not found, skipping integration test");
        return;
      }

      const report = parser.parseFromFile(realReportPath);

      // Test category analysis
      const byCategory = parser.getFindingsByCategory(report);
      expect(Object.keys(byCategory).length).toBeGreaterThan(0);

      // Test severity analysis
      const bySeverity = parser.getFindingsBySeverity(report);
      expect(Object.keys(bySeverity).length).toBeGreaterThan(0);

      // Test file analysis
      const lowest = parser.getLowestScoringFiles(report, 5);
      expect(lowest.length).toBeGreaterThan(0);
      expect(lowest[0].score).toBeLessThanOrEqual(lowest[lowest.length - 1].score);

      const highest = parser.getHighestScoringFiles(report, 5);
      expect(highest.length).toBeGreaterThan(0);
      expect(highest[0].score).toBeGreaterThanOrEqual(highest[highest.length - 1].score);
    });

    it("should export real data in all formats", () => {
      if (!existsSync(realReportPath)) {
        console.log("⚠️  Real report file not found, skipping integration test");
        return;
      }

      const report = parser.parseFromFile(realReportPath);

      // Test JSON export
      const jsonExport = parser.exportToFormat(report, "json");
      expect(() => JSON.parse(jsonExport)).not.toThrow();

      // Test CSV export
      const csvExport = parser.exportToFormat(report, "csv");
      expect(csvExport).toContain("File Path,Overall Score,Findings Count");
      expect(csvExport.split("\n").length).toBeGreaterThan(1);

      // Test summary export
      const summaryExport = parser.exportToFormat(report, "summary");
      expect(summaryExport).toContain("Humility Analysis Summary");
      expect(summaryExport).toContain("Files Analyzed:");
      expect(summaryExport).toContain("Total Findings:");
    });

    it("should handle edge cases in real data", () => {
      if (!existsSync(realReportPath)) {
        console.log("⚠️  Real report file not found, skipping integration test");
        return;
      }

      const report = parser.parseFromFile(realReportPath);

      // Test with very restrictive filters
      const restrictiveReport = parser.filterReport(report, {
        minSeverity: SeverityLevel.CRITICAL,
        minConfidence: 0.95,
        categories: [DetectionCategory.SUPERLATIVES],
      });

      expect(restrictiveReport.filtered_summary.filtered_findings).toBeGreaterThanOrEqual(0);
      expect(restrictiveReport.filtered_summary.filtered_files).toBeGreaterThanOrEqual(0);

      // Test with no filters
      const unfilteredReport = parser.filterReport(report);
      expect(unfilteredReport.filtered_summary.filtered_findings).toBe(report.summary.total_findings);
      expect(unfilteredReport.filtered_summary.filtered_files).toBe(report.summary.total_files);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent file gracefully", () => {
      expect(() => {
        parser.parseFromFile("/non/existent/file.json");
      }).toThrow("Humility report file not found");
    });

    it("should handle malformed JSON gracefully", () => {
      expect(() => {
        parser.parseFromString("{ invalid json }");
      }).toThrow("Failed to parse humility report");
    });

    it("should handle empty report gracefully", () => {
      const emptyReport = {
        summary: { total_files: 0, total_findings: 0, average_score: 0 },
        profiles: {},
      };

      const report = parser.parseFromString(JSON.stringify(emptyReport));
      expect(report.summary.total_files).toBe(0);
      expect(report.summary.total_findings).toBe(0);

      const byCategory = parser.getFindingsByCategory(report);
      expect(Object.keys(byCategory).length).toBe(0);
    });
  });
});
