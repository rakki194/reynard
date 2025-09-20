/**
 * Zod schemas for humility detector output validation
 */

import { z } from 'zod';

export const SeverityLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const ConfidenceLevelSchema = z.enum(['low', 'medium', 'high', 'very_high']);

export const DetectionCategorySchema = z.enum([
  'superlatives',
  'exaggeration', 
  'self_promotion',
  'dismissiveness',
  'absolute_claims',
  'hype_language'
]);

export const LinguisticFeaturesSchema = z.object({
  pattern_matched: z.string(),
  word_position: z.number(),
  line_length: z.number(),
  surrounding_words: z.array(z.string())
});

export const BehavioralIndicatorsSchema = z.record(z.any());

export const CulturalContextSchema = z.record(z.any()).nullable();

export const HumilityFindingSchema = z.object({
  file_path: z.string(),
  line_number: z.number(),
  category: DetectionCategorySchema,
  severity: SeverityLevelSchema,
  confidence: ConfidenceLevelSchema,
  original_text: z.string(),
  suggested_replacement: z.string(),
  context: z.string(),
  confidence_score: z.number(),
  hexaco_score: z.number().nullable(),
  epistemic_humility_score: z.number().nullable(),
  sentiment_score: z.number().nullable(),
  linguistic_features: LinguisticFeaturesSchema,
  behavioral_indicators: BehavioralIndicatorsSchema,
  cultural_context: CulturalContextSchema,
  timestamp: z.string()
});

export const HumilityProfileSchema = z.object({
  overall_score: z.number(),
  hexaco_honesty_humility: z.number(),
  epistemic_humility: z.number(),
  linguistic_humility: z.number(),
  behavioral_humility: z.number(),
  cultural_adaptation: z.number(),
  findings: z.array(HumilityFindingSchema),
  recommendations: z.array(z.string()),
  improvement_areas: z.array(z.string()),
  strengths: z.array(z.string()),
  timestamp: z.string()
});

export const HumilityReportSummarySchema = z.object({
  total_files: z.number(),
  total_findings: z.number(),
  average_score: z.number()
});

export const HumilityReportSchema = z.object({
  summary: HumilityReportSummarySchema,
  profiles: z.record(z.string(), HumilityProfileSchema)
});

export const ParsedHumilityReportSchema = HumilityReportSchema.extend({
  metadata: z.object({
    parsed_at: z.string(),
    parser_version: z.string(),
    source_file: z.string().optional()
  })
});

export const HumilityAnalysisOptionsSchema = z.object({
  minSeverity: SeverityLevelSchema.optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  categories: z.array(DetectionCategorySchema).optional(),
  filePatterns: z.array(z.string()).optional()
});

export const FilteredHumilityReportSchema = ParsedHumilityReportSchema.extend({
  filtered_summary: z.object({
    filtered_files: z.number(),
    filtered_findings: z.number(),
    average_score: z.number(),
    original_total_files: z.number(),
    original_total_findings: z.number()
  })
});
