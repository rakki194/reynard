/**
 * 🦊 CSS Variable Validator - Main Export
 * Main entry point for the CSS variable validation tool
 */

export { CSSVariableValidator } from "./CSSVariableValidator.js";
export { CSSLogger } from "./logger.js";
export { FileManager } from "./fileManager.js";
export { VariableExtractor } from "./variableExtractor.js";
export { VariableValidator } from "./variableValidator.js";
export { ReportGenerator } from "./reportGenerator.js";

export type {
  CSSVariableDefinition,
  CSSVariableUsage,
  CSSImport,
  CSSFileVariables,
  ValidationIssue,
  MissingVariable,
  UnusedVariable,
  TypoIssue,
  ValidationResult,
  ValidationSummary,
  ValidationMetadata,
  ValidatorConfig,
  CSSFile,
  ColorConfig,
  Logger,
  ReportOptions,
  FixOptions,
  FixResult,
  AppliedFix,
} from "./types.js";

// Re-export for convenience
export { CSSVariableValidator as default } from "./CSSVariableValidator.js";
