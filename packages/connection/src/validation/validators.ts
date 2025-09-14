/**
 * Common Validation Functions
 *
 * Convenience functions for common validation patterns used throughout
 * the Reynard framework. These functions provide simple, direct validation
 * without requiring schema objects.
 */

import { ValidationResult, ValidationUtils } from "./core";

// ============================================================================
// Basic Field Validators
// ============================================================================

/**
 * Validate an email address
 */
export function validateEmail(
  email: string,
  fieldName = "email",
): ValidationResult {
  return ValidationUtils.validateValue(
    email,
    {
      type: "email",
      required: true,
      errorMessage: "Must be a valid email address",
    },
    { fieldName },
  );
}

/**
 * Validate a password
 */
export function validatePassword(
  password: string,
  fieldName = "password",
): ValidationResult {
  return ValidationUtils.validateValue(
    password,
    {
      type: "string",
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      errorMessage:
        "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
    },
    { fieldName },
  );
}

/**
 * Validate a username
 */
export function validateUsername(
  username: string,
  fieldName = "username",
): ValidationResult {
  return ValidationUtils.validateValue(
    username,
    {
      type: "string",
      required: true,
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_-]+$/,
      errorMessage:
        "Username must be 3-30 characters with only letters, numbers, underscores, and hyphens",
    },
    { fieldName },
  );
}

/**
 * Validate a URL
 */
export function validateUrl(url: string, fieldName = "url"): ValidationResult {
  return ValidationUtils.validateValue(
    url,
    {
      type: "url",
      required: true,
      errorMessage: "Must be a valid URL",
    },
    { fieldName },
  );
}

/**
 * Validate any value against a schema
 */
export function validateValue(
  value: unknown,
  schema: {
    type:
      | "string"
      | "number"
      | "boolean"
      | "object"
      | "array"
      | "email"
      | "url"
      | "date";
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: unknown[];
    errorMessage?: string;
  },
  fieldName = "field",
): ValidationResult {
  return ValidationUtils.validateValue(value, schema, { fieldName });
}

// ============================================================================
// API Validators
// ============================================================================

/**
 * Validate an API key
 */
export function validateApiKey(
  apiKey: string,
  fieldName = "apiKey",
): ValidationResult {
  return ValidationUtils.validateValue(
    apiKey,
    {
      type: "string",
      required: true,
      minLength: 10,
      maxLength: 256,
      pattern: /^[a-zA-Z0-9_-]+$/,
      errorMessage:
        "API key must be 10-256 characters with only letters, numbers, underscores, and hyphens",
    },
    { fieldName },
  );
}

/**
 * Validate an authentication token
 */
export function validateToken(
  token: string,
  fieldName = "token",
): ValidationResult {
  return ValidationUtils.validateValue(
    token,
    {
      type: "string",
      required: true,
      minLength: 20,
      maxLength: 512,
      errorMessage: "Token must be 20-512 characters",
    },
    { fieldName },
  );
}

// ============================================================================
// File and Media Validators
// ============================================================================

/**
 * Validate a filename
 */
export function validateFileName(
  fileName: string,
  fieldName = "fileName",
): ValidationResult {
  return ValidationUtils.validateValue(
    fileName,
    {
      type: "string",
      required: true,
      minLength: 1,
      maxLength: 255,
      pattern: /^[^<>:"/\\|?*\x00-\x1f]+$/,
      errorMessage: "Filename cannot contain invalid characters",
    },
    { fieldName },
  );
}

/**
 * Validate a MIME type
 */
export function validateMimeType(
  mimeType: string,
  fieldName = "mimeType",
): ValidationResult {
  return ValidationUtils.validateValue(
    mimeType,
    {
      type: "string",
      required: true,
      pattern:
        /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/,
      errorMessage: "Must be a valid MIME type",
    },
    { fieldName },
  );
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  fieldName = "fileSize",
  maxSize = 100 * 1024 * 1024, // 100MB default
): ValidationResult {
  return ValidationUtils.validateValue(
    fileSize,
    {
      type: "number",
      required: true,
      min: 0,
      max: maxSize,
      errorMessage: `File size must be between 0 and ${Math.round(maxSize / 1024 / 1024)}MB`,
    },
    { fieldName },
  );
}

// ============================================================================
// Configuration Validators
// ============================================================================

/**
 * Validate a port number
 */
export function validatePort(
  port: number,
  fieldName = "port",
): ValidationResult {
  return ValidationUtils.validateValue(
    port,
    {
      type: "number",
      required: true,
      min: 1,
      max: 65535,
      errorMessage: "Port must be between 1 and 65535",
    },
    { fieldName },
  );
}

/**
 * Validate a timeout value
 */
export function validateTimeout(
  timeout: number,
  fieldName = "timeout",
): ValidationResult {
  return ValidationUtils.validateValue(
    timeout,
    {
      type: "number",
      required: true,
      min: 1000,
      max: 300000, // 5 minutes
      errorMessage: "Timeout must be between 1 second and 5 minutes",
    },
    { fieldName },
  );
}

/**
 * Validate retry count
 */
export function validateRetryCount(
  retryCount: number,
  fieldName = "retryCount",
): ValidationResult {
  return ValidationUtils.validateValue(
    retryCount,
    {
      type: "number",
      required: true,
      min: 0,
      max: 10,
      errorMessage: "Retry count must be between 0 and 10",
    },
    { fieldName },
  );
}

// ============================================================================
// AI/ML Validators
// ============================================================================

/**
 * Validate a model name
 */
export function validateModelName(
  modelName: string,
  fieldName = "modelName",
): ValidationResult {
  return ValidationUtils.validateValue(
    modelName,
    {
      type: "string",
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9._-]+$/,
      errorMessage:
        "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens",
    },
    { fieldName },
  );
}

/**
 * Validate a prompt
 */
export function validatePrompt(
  prompt: string,
  fieldName = "prompt",
): ValidationResult {
  return ValidationUtils.validateValue(
    prompt,
    {
      type: "string",
      required: true,
      minLength: 1,
      maxLength: 10000,
      errorMessage: "Prompt must be 1-10000 characters",
    },
    { fieldName },
  );
}

/**
 * Validate temperature parameter
 */
export function validateTemperature(
  temperature: number,
  fieldName = "temperature",
): ValidationResult {
  return ValidationUtils.validateValue(
    temperature,
    {
      type: "number",
      required: true,
      min: 0,
      max: 2,
      errorMessage: "Temperature must be between 0 and 2",
    },
    { fieldName },
  );
}

/**
 * Validate max tokens parameter
 */
export function validateMaxTokens(
  maxTokens: number,
  fieldName = "maxTokens",
): ValidationResult {
  return ValidationUtils.validateValue(
    maxTokens,
    {
      type: "number",
      required: true,
      min: 1,
      max: 100000,
      errorMessage: "Max tokens must be between 1 and 100000",
    },
    { fieldName },
  );
}

// ============================================================================
// UI/UX Validators
// ============================================================================

/**
 * Validate a theme
 */
export function validateTheme(
  theme: string,
  fieldName = "theme",
): ValidationResult {
  return ValidationUtils.validateValue(
    theme,
    {
      type: "string",
      required: true,
      enum: ["light", "dark", "auto"],
      errorMessage: "Theme must be light, dark, or auto",
    },
    { fieldName },
  );
}

/**
 * Validate a language code
 */
export function validateLanguage(
  language: string,
  fieldName = "language",
): ValidationResult {
  return ValidationUtils.validateValue(
    language,
    {
      type: "string",
      required: true,
      minLength: 2,
      maxLength: 5,
      pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
      errorMessage:
        "Language must be a valid locale code (e.g., 'en' or 'en-US')",
    },
    { fieldName },
  );
}

/**
 * Validate a color value
 */
export function validateColor(
  color: string,
  fieldName = "color",
): ValidationResult {
  return ValidationUtils.validateValue(
    color,
    {
      type: "string",
      required: true,
      pattern:
        /^#[0-9A-Fa-f]{6}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
      errorMessage: "Color must be a valid hex, RGB, or HSL color",
    },
    { fieldName },
  );
}

// ============================================================================
// Utility Validators
// ============================================================================

/**
 * Validate that a value is not empty
 */
export function validateNotEmpty(
  value: unknown,
  fieldName = "field",
): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
      field: fieldName,
      value,
    };
  }
  return { isValid: true, field: fieldName, value };
}

/**
 * Validate that a value is a positive number
 */
export function validatePositive(
  value: number,
  fieldName = "field",
): ValidationResult {
  if (typeof value !== "number" || value <= 0) {
    return {
      isValid: false,
      error: `${fieldName} must be a positive number`,
      field: fieldName,
      value,
    };
  }
  return { isValid: true, field: fieldName, value };
}

/**
 * Validate that a value is within a range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName = "field",
): ValidationResult {
  if (typeof value !== "number" || value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
      field: fieldName,
      value,
    };
  }
  return { isValid: true, field: fieldName, value };
}
