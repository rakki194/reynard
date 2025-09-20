/**
 * Tests for Zod schemas
 */

import { describe, it, expect } from "vitest";
import {
  SeverityLevelSchema,
  ConfidenceLevelSchema,
  DetectionCategorySchema,
  LinguisticFeaturesSchema,
  BehavioralIndicatorsSchema,
  CulturalContextSchema,
  HumilityFindingSchema,
  HumilityProfileSchema,
  HumilityReportSchema,
  ParsedHumilityReportSchema,
  HumilityAnalysisOptionsSchema,
} from "../schemas";

describe("Zod Schemas", () => {
  describe("SeverityLevelSchema", () => {
    it("should validate correct severity levels", () => {
      expect(SeverityLevelSchema.parse("low")).toBe("low");
      expect(SeverityLevelSchema.parse("medium")).toBe("medium");
      expect(SeverityLevelSchema.parse("high")).toBe("high");
      expect(SeverityLevelSchema.parse("critical")).toBe("critical");
    });

    it("should reject invalid severity levels", () => {
      expect(() => SeverityLevelSchema.parse("invalid")).toThrow();
      expect(() => SeverityLevelSchema.parse("")).toThrow();
      expect(() => SeverityLevelSchema.parse(null)).toThrow();
    });
  });

  describe("ConfidenceLevelSchema", () => {
    it("should validate correct confidence levels", () => {
      expect(ConfidenceLevelSchema.parse("low")).toBe("low");
      expect(ConfidenceLevelSchema.parse("medium")).toBe("medium");
      expect(ConfidenceLevelSchema.parse("high")).toBe("high");
      expect(ConfidenceLevelSchema.parse("very_high")).toBe("very_high");
    });

    it("should reject invalid confidence levels", () => {
      expect(() => ConfidenceLevelSchema.parse("invalid")).toThrow();
      expect(() => ConfidenceLevelSchema.parse("")).toThrow();
    });
  });

  describe("DetectionCategorySchema", () => {
    it("should validate correct categories", () => {
      expect(DetectionCategorySchema.parse("superlatives")).toBe("superlatives");
      expect(DetectionCategorySchema.parse("exaggeration")).toBe("exaggeration");
      expect(DetectionCategorySchema.parse("self_promotion")).toBe("self_promotion");
      expect(DetectionCategorySchema.parse("dismissiveness")).toBe("dismissiveness");
      expect(DetectionCategorySchema.parse("absolute_claims")).toBe("absolute_claims");
      expect(DetectionCategorySchema.parse("hype_language")).toBe("hype_language");
      expect(DetectionCategorySchema.parse("exclusivity_claims")).toBe("exclusivity_claims");
      expect(DetectionCategorySchema.parse("other")).toBe("other");
    });

    it("should reject invalid categories", () => {
      expect(() => DetectionCategorySchema.parse("invalid")).toThrow();
      expect(() => DetectionCategorySchema.parse("")).toThrow();
    });
  });

  describe("LinguisticFeaturesSchema", () => {
    it("should validate complete linguistic features", () => {
      const features = {
        pattern_matched: "\\b(best|most)\\b",
        word_position: 10,
        line_length: 25,
        surrounding_words: ["This", "is", "the", "best", "solution"],
      };

      expect(LinguisticFeaturesSchema.parse(features)).toEqual(features);
    });

    it("should validate partial linguistic features", () => {
      const features = {
        pattern_matched: "\\b(best|most)\\b",
      };

      expect(LinguisticFeaturesSchema.parse(features)).toEqual(features);
    });

    it("should validate empty linguistic features", () => {
      expect(LinguisticFeaturesSchema.parse({})).toEqual({});
    });
  });

  describe("BehavioralIndicatorsSchema", () => {
    it("should validate object behavioral indicators", () => {
      const indicators = { key1: "value1", key2: 42 };
      expect(BehavioralIndicatorsSchema.parse(indicators)).toEqual(indicators);
    });

    it("should validate array behavioral indicators", () => {
      const indicators = ["item1", "item2", 42];
      expect(BehavioralIndicatorsSchema.parse(indicators)).toEqual(indicators);
    });

    it("should validate empty object", () => {
      expect(BehavioralIndicatorsSchema.parse({})).toEqual({});
    });

    it("should validate empty array", () => {
      expect(BehavioralIndicatorsSchema.parse([])).toEqual([]);
    });
  });

  describe("CulturalContextSchema", () => {
    it("should validate object cultural context", () => {
      const context = { region: "western", language: "en" };
      expect(CulturalContextSchema.parse(context)).toEqual(context);
    });

    it("should validate array cultural context", () => {
      const context = ["western", "en"];
      expect(CulturalContextSchema.parse(context)).toEqual(context);
    });

    it("should validate null cultural context", () => {
      expect(CulturalContextSchema.parse(null)).toBe(null);
    });
  });

  describe("HumilityFindingSchema", () => {
    it("should validate complete finding", () => {
      const finding = {
        file_path: "test.md",
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
          pattern_matched: "\\b(best|most)\\b",
          word_position: 10,
          line_length: 25,
          surrounding_words: ["This", "is", "the", "best", "solution"],
        },
        behavioral_indicators: {},
        cultural_context: null,
        timestamp: "2025-09-20T18:00:00.000Z",
      };

      expect(HumilityFindingSchema.parse(finding)).toEqual(finding);
    });

    it("should validate finding with array behavioral indicators", () => {
      const finding = {
        file_path: "test.md",
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
        linguistic_features: {},
        behavioral_indicators: ["indicator1", "indicator2"],
        cultural_context: null,
        timestamp: "2025-09-20T18:00:00.000Z",
      };

      expect(HumilityFindingSchema.parse(finding)).toEqual(finding);
    });
  });

  describe("HumilityProfileSchema", () => {
    it("should validate complete profile", () => {
      const profile = {
        overall_score: 80.0,
        hexaco_honesty_humility: 50.0,
        epistemic_humility: 0.0,
        linguistic_humility: 0.0,
        behavioral_humility: 0.0,
        cultural_adaptation: 0.0,
        findings: [],
        recommendations: ["Use more moderate language"],
        improvement_areas: ["Superlative language"],
        strengths: ["Clear communication"],
        timestamp: "2025-09-20T18:00:00.000Z",
      };

      expect(HumilityProfileSchema.parse(profile)).toEqual(profile);
    });
  });

  describe("HumilityReportSchema", () => {
    it("should validate complete report", () => {
      const report = {
        summary: {
          total_files: 2,
          total_findings: 3,
          average_score: 75.5,
        },
        profiles: {
          "test-file.md": {
            overall_score: 80.0,
            hexaco_honesty_humility: 50.0,
            epistemic_humility: 0.0,
            linguistic_humility: 0.0,
            behavioral_humility: 0.0,
            cultural_adaptation: 0.0,
            findings: [],
            recommendations: [],
            improvement_areas: [],
            strengths: [],
            timestamp: "2025-09-20T18:00:00.000Z",
          },
        },
      };

      expect(HumilityReportSchema.parse(report)).toEqual(report);
    });
  });

  describe("ParsedHumilityReportSchema", () => {
    it("should validate parsed report with metadata", () => {
      const report = {
        summary: {
          total_files: 1,
          total_findings: 0,
          average_score: 100.0,
        },
        profiles: {},
        metadata: {
          parsed_at: "2025-09-20T18:00:00.000Z",
          parser_version: "1.0.0",
          source_file: "test.json",
        },
      };

      expect(ParsedHumilityReportSchema.parse(report)).toEqual(report);
    });
  });

  describe("HumilityAnalysisOptionsSchema", () => {
    it("should validate complete options", () => {
      const options = {
        minSeverity: "high",
        minConfidence: 0.8,
        categories: ["superlatives", "self_promotion"],
        filePatterns: ["README", "docs"],
      };

      expect(HumilityAnalysisOptionsSchema.parse(options)).toEqual(options);
    });

    it("should validate partial options", () => {
      const options = {
        minSeverity: "medium",
      };

      expect(HumilityAnalysisOptionsSchema.parse(options)).toEqual(options);
    });

    it("should validate empty options", () => {
      expect(HumilityAnalysisOptionsSchema.parse({})).toEqual({});
    });

    it("should reject invalid confidence values", () => {
      expect(() => HumilityAnalysisOptionsSchema.parse({ minConfidence: 1.5 })).toThrow();
      expect(() => HumilityAnalysisOptionsSchema.parse({ minConfidence: -0.1 })).toThrow();
    });
  });
});
