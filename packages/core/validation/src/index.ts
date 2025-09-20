/**
 * Reynard Validation Package
 *
 * Unified validation utilities for the Reynard framework.
 * This package consolidates all validation logic from across the ecosystem
 * into a single, consistent, and powerful validation system.
 */

// ============================================================================
// Core Exports
// ============================================================================

export { ValidationUtils } from "./core.js";
export { ValidationError } from "./types.js";

// ============================================================================
// Type Exports
// ============================================================================

export type {
  FieldValidationOptions,
  FileValidationOptions,
  FileValidationResult,
  FormValidationOptions,
  FormValidationResult,
  MultiValidationResult,
  PasswordStrength,
  URLValidationResult,
  ValidationErrorContext,
  ValidationResult,
  ValidationRules,
  ValidationSchema,
} from "./types.js";

// ============================================================================
// Schema Exports
// ============================================================================

export {
  CommonSchemas,
  FormSchemas,
  createCustomSchema,
  createEnumSchema,
  createNumberSchema,
  createStringSchema,
} from "./schemas.js";

// ============================================================================
// Utility Function Exports
// ============================================================================

export {
  // API validators
  validateApiKey,
  validateColor,
  // Basic validators
  validateEmail,
  // File validators
  validateFileName,
  validateFileSize,
  validateLanguage,
  validateMaxTokens,
  validateMimeType,
  // AI/ML validators
  validateModelName,
  // Utility validators
  validateNotEmpty,
  validatePassword,
  // Advanced validators
  validatePasswordStrength,
  // Configuration validators
  validatePort,
  validatePositive,
  validatePrompt,
  validateRange,
  validateRetryCount,
  validateTemperature,
  // UI/UX validators
  validateTheme,
  validateTimeout,
  validateToken,
  validateUrl,
  validateUrlSecurity,
  validateUsername,
  validateValue,
} from "./utils.js";

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

// These maintain compatibility with existing code that might import from
// the old validation locations
export {
  validateEmail as validateEmailCore,
  validatePassword as validatePasswordCore,
  validateUrl as validateUrlCore,
  validateUsername as validateUsernameCore,
} from "./utils.js";
