/**
 * 🦊 Reynard Validation Index
 * 
 * Main export for validation functionality.
 */

export { ValidationEngine } from "./ValidationEngine.js";
export type {
  ValidationConfig,
  ValidationResult,
  ValidationRule,
  ValidationContext,
  ValidationIssue,
  ValidationSeverity,
  FilePatternRule,
  FileContentRule,
  CommandRule,
  CustomRule,
  ValidationPreset,
  ValidationReport,
  ValidationCache,
  ValidationStats
} from "../types/Validation.js";
