/**
 * Tests for HumilityParser
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HumilityParser } from "../parser";
import { SeverityLevel, DetectionCategory, ConfidenceLevel } from "../types";

describe("HumilityParser", () => {
  let parser: HumilityParser;
  let sampleReport: any;

  beforeEach(() => {
    parser = new HumilityParser();
    sampleReport = {
      summary: {
        total_files: 2,
        total_findings: 3,
        average_score: 75.5,
      },
      profiles: {
        "test-file-1.md": {
          overall_score: 80.0,
          hexaco_honesty_humility: 50.0,
          epistemic_humility: 0.0,
          linguistic_humility: 0.0,
          behavioral_humility: 0.0,
          cultural_adaptation: 0.0,
          findings: [
            {
              file_path: "test-file-1.md",
              line_number: 1,
              category: "superlatives",
              severity: "high",
              confidence: "high",
              original_text: "best",
              suggested_replacement: "good",
              context: "This is the best solution",
              confidence_score: 0.8,
              hexaco_score: null,
              epistemic_humility_score: null,
              sentiment_score: null,
              linguistic_features: {
                pattern_matched: "\\b(best|most|greatest)\\b",
                word_position: 10,
                line_length: 25,
                surrounding_words: ["This", "is", "the", "best", "solution"],
              },
              behavioral_indicators: {},
              cultural_context: null,
              timestamp: "2025-09-20T18:00:00.000Z",
            },
          ],
          recommendations: ["Use more moderate language"],
          improvement_areas: ["Superlative language"],
          strengths: ["Clear communication"],
          timestamp: "2025-09-20T18:00:00.000Z",
        },
        "test-file-2.md": {
          overall_score: 71.0,
          hexaco_honesty_humility: 50.0,
          epistemic_humility: 0.0,
          linguistic_humility: 0.0,
          behavioral_humility: 0.0,
          cultural_adaptation: 0.0,
          findings: [
            {
              file_path: "test-file-2.md",
              line_number: 5,
              category: "dismissiveness",
              severity: "medium",
              confidence: "medium",
              original_text: "simple",
              suggested_replacement: "straightforward",
              context: "This is a simple approach",
              confidence_score: 0.6,
              hexaco_score: null,
              epistemic_humility_score: null,
              sentiment_score: null,
              linguistic_features: {
                pattern_matched: "\\b(simple|basic)\\b",
                word_position: 15,
                line_length: 30,
                surrounding_words: ["This", "is", "a", "simple", "approach"],
              },
              behavioral_indicators: {},
              cultural_context: null,
              timestamp: "2025-09-20T18:00:00.000Z",
            },
            {
              file_path: "test-file-2.md",
              line_number: 10,
              category: "absolute_claims",
              severity: "low",
              confidence: "low",
              original_text: "always",
              suggested_replacement: "often",
              context: "This always works",
              confidence_score: 0.4,
              hexaco_score: null,
              epistemic_humility_score: null,
              sentiment_score: null,
              linguistic_features: {
                pattern_matched: "\\b(always|never|all|every)\\b",
                word_position: 5,
                line_length: 20,
                surrounding_words: ["This", "always", "works"],
              },
              behavioral_indicators: {},
              cultural_context: null,
              timestamp: "2025-09-20T18:00:00.000Z",
            },
          ],
          recommendations: ["Avoid dismissive language", "Use qualifying terms"],
          improvement_areas: ["Dismissiveness", "Absolute claims"],
          strengths: ["Technical accuracy"],
          timestamp: "2025-09-20T18:00:00.000Z",
        },
      },
    };
  });

  describe("parseFromString", () => {
    it("should parse valid JSON report", () => {
      const result = parser.parseFromString(JSON.stringify(sampleReport));

      expect(result.summary.total_files).toBe(2);
      expect(result.summary.total_findings).toBe(3);
      expect(result.summary.average_score).toBe(75.5);
      expect(result.metadata.parser_version).toBe("1.0.0");
      expect(result.metadata.parsed_at).toBeDefined();
    });

    it("should include source file in metadata when provided", () => {
      const result = parser.parseFromString(JSON.stringify(sampleReport), "test-report.json");

      expect(result.metadata.source_file).toBe("test-report.json");
    });

    it("should throw error for invalid JSON", () => {
      expect(() => {
        parser.parseFromString("invalid json");
      }).toThrow("Failed to parse humility report");
    });

    it("should throw error for invalid report structure", () => {
      const invalidReport = { invalid: "structure" };

      expect(() => {
        parser.parseFromString(JSON.stringify(invalidReport));
      }).toThrow("Failed to parse humility report");
    });
  });

  describe("filterReport", () => {
    it("should filter by minimum severity", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const filtered = parser.filterReport(parsedReport, {
        minSeverity: SeverityLevel.HIGH,
      });

      expect(filtered.filtered_summary.filtered_findings).toBe(1);
      expect(filtered.filtered_summary.filtered_files).toBe(1);
    });

    it("should filter by minimum confidence", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const filtered = parser.filterReport(parsedReport, {
        minConfidence: 0.7,
      });

      expect(filtered.filtered_summary.filtered_findings).toBe(1);
    });

    it("should filter by categories", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const filtered = parser.filterReport(parsedReport, {
        categories: [DetectionCategory.SUPERLATIVES],
      });

      expect(filtered.filtered_summary.filtered_findings).toBe(1);
    });

    it("should filter by file patterns", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const filtered = parser.filterReport(parsedReport, {
        filePatterns: ["test-file-1"],
      });

      expect(filtered.filtered_summary.filtered_files).toBe(1);
    });

    it("should return all data when no filters applied", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const filtered = parser.filterReport(parsedReport);

      expect(filtered.filtered_summary.filtered_files).toBe(2);
      expect(filtered.filtered_summary.filtered_findings).toBe(3);
    });
  });

  describe("getSummary", () => {
    it("should return correct summary for unfiltered report", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const summary = parser.getSummary(parsedReport);

      expect(summary.totalFiles).toBe(2);
      expect(summary.totalFindings).toBe(3);
      expect(summary.averageScore).toBe(75.5);
      expect(summary.isFiltered).toBe(false);
    });

    it("should return correct summary for filtered report", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const filtered = parser.filterReport(parsedReport, {
        minSeverity: SeverityLevel.HIGH,
      });
      const summary = parser.getSummary(filtered);

      expect(summary.totalFiles).toBe(1);
      expect(summary.totalFindings).toBe(1);
      expect(summary.isFiltered).toBe(true);
      expect(summary.originalFiles).toBe(2);
      expect(summary.originalFindings).toBe(3);
    });
  });

  describe("getFindingsByCategory", () => {
    it("should group findings by category", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const byCategory = parser.getFindingsByCategory(parsedReport);

      expect(byCategory.superlatives).toBe(1);
      expect(byCategory.dismissiveness).toBe(1);
      expect(byCategory.absolute_claims).toBe(1);
    });
  });

  describe("getFindingsBySeverity", () => {
    it("should group findings by severity", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const bySeverity = parser.getFindingsBySeverity(parsedReport);

      expect(bySeverity.high).toBe(1);
      expect(bySeverity.medium).toBe(1);
      expect(bySeverity.low).toBe(1);
    });
  });

  describe("getLowestScoringFiles", () => {
    it("should return files with lowest scores", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const lowest = parser.getLowestScoringFiles(parsedReport);

      expect(lowest).toHaveLength(2);
      expect(lowest[0].score).toBe(71.0);
      expect(lowest[1].score).toBe(80.0);
    });
  });

  describe("getHighestScoringFiles", () => {
    it("should return files with highest scores", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const highest = parser.getHighestScoringFiles(parsedReport);

      expect(highest).toHaveLength(2);
      expect(highest[0].score).toBe(80.0);
      expect(highest[1].score).toBe(71.0);
    });
  });

  describe("exportToFormat", () => {
    it("should export to JSON format", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const json = parser.exportToFormat(parsedReport, "json");

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("should export to CSV format", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const csv = parser.exportToFormat(parsedReport, "csv");

      expect(csv).toContain("File Path,Overall Score,Findings Count");
      expect(csv).toContain("test-file-1.md");
    });

    it("should export to summary format", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
      const summary = parser.exportToFormat(parsedReport, "summary");

      expect(summary).toContain("Humility Analysis Summary");
      expect(summary).toContain("Files Analyzed: 2");
      expect(summary).toContain("Total Findings: 3");
    });

    it("should throw error for unsupported format", () => {
      const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));

      expect(() => {
        parser.exportToFormat(parsedReport, "xml" as any);
      }).toThrow("Unsupported export format: xml");
    });
  });
});
