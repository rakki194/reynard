/**
 * Reynard Humility Parser
 * 
 * A TypeScript parser for humility detector output reports with validation,
 * filtering, and analysis capabilities.
 */

// Main exports
export { HumilityParser } from './parser';

// Type exports
export type {
  HumilityReport,
  ParsedHumilityReport,
  FilteredHumilityReport,
  HumilityFinding,
  HumilityProfile,
  HumilityReportSummary,
  HumilityAnalysisOptions,
  SeverityLevel,
  ConfidenceLevel,
  DetectionCategory,
  LinguisticFeatures,
  BehavioralIndicators,
  CulturalContext
} from './types';

// Enum exports
export {
  SeverityLevel,
  ConfidenceLevel,
  DetectionCategory
} from './types';

// Schema exports
export {
  HumilityReportSchema,
  ParsedHumilityReportSchema,
  FilteredHumilityReportSchema,
  HumilityAnalysisOptionsSchema,
  HumilityFindingSchema,
  HumilityProfileSchema
} from './schemas';

// Utility exports
export {
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
  formatFilePath
} from './utils';

// Version information
export const VERSION = '1.0.0';
export const PARSER_NAME = 'reynard-humility-parser';

// Convenience function for quick parsing
export function parseHumilityReport(filePath: string) {
  const parser = new HumilityParser();
  return parser.parseFromFile(filePath);
}

// Convenience function for parsing from string
export function parseHumilityReportFromString(jsonString: string, sourceFile?: string) {
  const parser = new HumilityParser();
  return parser.parseFromString(jsonString, sourceFile);
}
