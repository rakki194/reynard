/**
 * Common Validation Schemas
 *
 * Pre-defined validation schemas for common data types and patterns
 * used throughout the Reynard framework.
 */

import { ValidationSchema } from "./core";

// ============================================================================
// Common Field Schemas
// ============================================================================

export const emailSchema: ValidationSchema = {
  type: "email",
  required: true,
  errorMessage: "Must be a valid email address",
};

export const passwordSchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 8,
  maxLength: 128,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  errorMessage:
    "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
};

export const usernameSchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 3,
  maxLength: 30,
  pattern: /^[a-zA-Z0-9_-]+$/,
  errorMessage:
    "Username must be 3-30 characters with only letters, numbers, underscores, and hyphens",
};

export const urlSchema: ValidationSchema = {
  type: "url",
  required: true,
  errorMessage: "Must be a valid URL",
};

export const optionalUrlSchema: ValidationSchema = {
  type: "url",
  required: false,
  errorMessage: "Must be a valid URL",
};

// ============================================================================
// API Schemas
// ============================================================================

export const apiKeySchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 10,
  maxLength: 256,
  pattern: /^[a-zA-Z0-9_-]+$/,
  errorMessage:
    "API key must be 10-256 characters with only letters, numbers, underscores, and hyphens",
};

export const tokenSchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 20,
  maxLength: 512,
  errorMessage: "Token must be 20-512 characters",
};

// ============================================================================
// File and Media Schemas
// ============================================================================

export const fileNameSchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 1,
  maxLength: 255,
  pattern: /^[^<>:"/\\|?*\x00-\x1f]+$/,
  errorMessage: "Filename cannot contain invalid characters",
};

export const mimeTypeSchema: ValidationSchema = {
  type: "string",
  required: true,
  pattern:
    /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/,
  errorMessage: "Must be a valid MIME type",
};

export const fileSizeSchema: ValidationSchema = {
  type: "number",
  required: true,
  min: 0,
  max: 100 * 1024 * 1024, // 100MB
  errorMessage: "File size must be between 0 and 100MB",
};

// ============================================================================
// Configuration Schemas
// ============================================================================

export const portSchema: ValidationSchema = {
  type: "number",
  required: true,
  min: 1,
  max: 65535,
  errorMessage: "Port must be between 1 and 65535",
};

export const timeoutSchema: ValidationSchema = {
  type: "number",
  required: true,
  min: 1000,
  max: 300000, // 5 minutes
  errorMessage: "Timeout must be between 1 second and 5 minutes",
};

export const retryCountSchema: ValidationSchema = {
  type: "number",
  required: true,
  min: 0,
  max: 10,
  errorMessage: "Retry count must be between 0 and 10",
};

// ============================================================================
// AI/ML Schemas
// ============================================================================

export const modelNameSchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 1,
  maxLength: 100,
  pattern: /^[a-zA-Z0-9._-]+$/,
  errorMessage:
    "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens",
};

export const promptSchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 1,
  maxLength: 10000,
  errorMessage: "Prompt must be 1-10000 characters",
};

export const temperatureSchema: ValidationSchema = {
  type: "number",
  required: true,
  min: 0,
  max: 2,
  errorMessage: "Temperature must be between 0 and 2",
};

export const maxTokensSchema: ValidationSchema = {
  type: "number",
  required: true,
  min: 1,
  max: 100000,
  errorMessage: "Max tokens must be between 1 and 100000",
};

// ============================================================================
// UI/UX Schemas
// ============================================================================

export const themeSchema: ValidationSchema = {
  type: "string",
  required: true,
  enum: ["light", "dark", "auto"],
  errorMessage: "Theme must be light, dark, or auto",
};

export const languageSchema: ValidationSchema = {
  type: "string",
  required: true,
  minLength: 2,
  maxLength: 5,
  pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
  errorMessage: "Language must be a valid locale code (e.g., 'en' or 'en-US')",
};

export const colorSchema: ValidationSchema = {
  type: "string",
  required: true,
  pattern:
    /^#[0-9A-Fa-f]{6}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
  errorMessage: "Color must be a valid hex, RGB, or HSL color",
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a schema with custom error message
 */
export function createSchema(
  baseSchema: ValidationSchema,
  customErrorMessage?: string,
): ValidationSchema {
  return {
    ...baseSchema,
    errorMessage: customErrorMessage || baseSchema.errorMessage,
  };
}

/**
 * Create an optional version of a schema
 */
export function makeOptional(schema: ValidationSchema): ValidationSchema {
  return {
    ...schema,
    required: false,
  };
}

/**
 * Create a required version of a schema
 */
export function makeRequired(schema: ValidationSchema): ValidationSchema {
  return {
    ...schema,
    required: true,
  };
}

/**
 * Create a schema with custom length constraints
 */
export function withLength(
  schema: ValidationSchema,
  minLength?: number,
  maxLength?: number,
): ValidationSchema {
  return {
    ...schema,
    minLength,
    maxLength,
  };
}

/**
 * Create a schema with custom numeric constraints
 */
export function withRange(
  schema: ValidationSchema,
  min?: number,
  max?: number,
): ValidationSchema {
  return {
    ...schema,
    min,
    max,
  };
}
