/**
 * TypeScript types for humility detector output parsing
 */

export enum SeverityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ConfidenceLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export enum DetectionCategory {
  SUPERLATIVES = "superlatives",
  EXAGGERATION = "exaggeration",
  SELF_PROMOTION = "self_promotion",
  DISMISSIVENESS = "dismissiveness",
  ABSOLUTE_CLAIMS = "absolute_claims",
  HYPE_LANGUAGE = "hype_language",
  EXCLUSIVITY_CLAIMS = "exclusivity_claims",
  OTHER = "other",
}

export interface LinguisticFeatures {
  pattern_matched?: string;
  word_position?: number;
  line_length?: number;
  surrounding_words?: string[];
}

export type BehavioralIndicators =
  | {
      [key: string]: any;
    }
  | any[];

export type CulturalContext =
  | {
      [key: string]: any;
    }
  | any[]
  | null;

export interface HumilityFinding {
  file_path: string;
  line_number: number;
  category: DetectionCategory;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  original_text: string;
  suggested_replacement: string;
  context: string;
  confidence_score: number;
  hexaco_score: number | null;
  epistemic_humility_score: number | null;
  sentiment_score: number | null;
  linguistic_features: LinguisticFeatures;
  behavioral_indicators: BehavioralIndicators;
  cultural_context: CulturalContext | null;
  timestamp: string;
}

export interface HumilityProfile {
  overall_score: number;
  hexaco_honesty_humility: number;
  epistemic_humility: number;
  linguistic_humility: number;
  behavioral_humility: number;
  cultural_adaptation: number;
  findings: HumilityFinding[];
  recommendations: string[];
  improvement_areas: string[];
  strengths: string[];
  timestamp: string;
}

export interface HumilityReportSummary {
  total_files: number;
  total_findings: number;
  average_score: number;
}

export interface HumilityReport {
  summary: HumilityReportSummary;
  profiles: Record<string, HumilityProfile>;
}

export interface ParsedHumilityReport extends HumilityReport {
  metadata: {
    parsed_at: string;
    parser_version: string;
    source_file?: string;
  };
}

export interface HumilityAnalysisOptions {
  minSeverity?: SeverityLevel;
  minConfidence?: number;
  categories?: DetectionCategory[];
  filePatterns?: string[];
}

export interface FilteredHumilityReport extends ParsedHumilityReport {
  filtered_summary: {
    filtered_files: number;
    filtered_findings: number;
    average_score: number;
    original_total_files: number;
    original_total_findings: number;
  };
}
