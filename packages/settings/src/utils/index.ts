/**
 * Settings Utilities
 * Helper functions for validation, migration, and settings management
 */

import type {
  SettingCondition,
  SettingDefinition,
  SettingsSchema,
} from "../types";

// Re-export consolidated validation utilities from reynard-connection
export {
  validateEmail,
  validatePassword,
  validateUrl,
  validateUsername,
  validateValue,
  validateApiKey,
  validateToken,
  validateTheme,
  validateLanguage,
  validateColor,
  ValidationUtils,
  type ValidationResult,
  type MultiValidationResult,
  type ValidationSchema,
  type FieldValidationOptions,
} from "reynard-connection";

// ============================================================================
// Settings-Specific Validation
// ============================================================================

/**
 * Validate a single setting value using the consolidated validation system
 */
export function validateSetting(
  definition: SettingDefinition,
  value: any,
): ValidationResult {
  const { validation, type, required } = definition;

  // Create validation schema from setting definition
  const schema: ValidationSchema = {
    type: type as any,
    required,
    minLength: validation?.minLength,
    maxLength: validation?.maxLength,
    min: validation?.min,
    max: validation?.max,
    pattern: validation?.pattern,
    errorMessage: validation?.errorMessage,
  };

  return ValidationUtils.validateValue(value, schema, {
    fieldName: definition.label,
  });
}

/**
 * Validate multiple settings at once
 */
export function validateSettings(
  settings: Record<string, any>,
  schema: SettingsSchema,
): MultiValidationResult {
  const results: Record<string, ValidationResult> = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(settings)) {
    const definition = schema[key as keyof SettingsSchema];
    if (definition) {
      const result = validateSetting(definition, value);
      results[key] = result;

      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
      if (result.warnings) {
        warnings.push(...result.warnings);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    results,
    errors,
    warnings,
  };
}

// ============================================================================
// Settings Migration Utilities
// ============================================================================

/**
 * Migrate settings from one version to another
 */
export function migrateSettings(
  settings: Record<string, any>,
  fromVersion: string,
  toVersion: string,
): Record<string, any> {
  // This would contain migration logic for different versions
  // For now, return settings as-is
  return settings;
}

/**
 * Validate settings schema
 */
export function validateSettingsSchema(schema: SettingsSchema): ValidationResult {
  const errors: string[] = [];

  for (const [key, definition] of Object.entries(schema)) {
    if (!definition.label) {
      errors.push(`Setting '${key}' is missing a label`);
    }

    if (!definition.type) {
      errors.push(`Setting '${key}' is missing a type`);
    }

    if (definition.validation) {
      const { minLength, maxLength, min, max } = definition.validation;
      
      if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
        errors.push(`Setting '${key}' has invalid length constraints`);
      }

      if (min !== undefined && max !== undefined && min > max) {
        errors.push(`Setting '${key}' has invalid range constraints`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors[0],
    warnings: errors.slice(1),
  };
}

// ============================================================================
// Settings Condition Utilities
// ============================================================================

/**
 * Evaluate setting conditions
 */
export function evaluateCondition(
  condition: SettingCondition,
  settings: Record<string, any>,
): boolean {
  const { key, operator, value } = condition;

  const fieldValue = settings[key];

  switch (operator) {
    case "equals":
      return fieldValue === value;
    case "not-equals":
      return fieldValue !== value;
    case "greater":
      return fieldValue > value;
    case "less":
      return fieldValue < value;
    case "contains":
      return String(fieldValue).includes(String(value));
    case "exists":
      return fieldValue !== null && fieldValue !== undefined;
    default:
      return false;
  }
}

/**
 * Check if a setting should be visible based on conditions
 */
export function isSettingVisible(
  definition: SettingDefinition,
  settings: Record<string, any>,
): boolean {
  if (!definition.conditions || definition.conditions.length === 0) {
    return true;
  }

  return definition.conditions.every(condition => 
    evaluateCondition(condition, settings)
  );
}

/**
 * Check if a setting should be enabled based on conditions
 */
export function isSettingEnabled(
  definition: SettingDefinition,
  settings: Record<string, any>,
): boolean {
  if (!definition.condition) {
    return true;
  }

  return evaluateCondition(definition.condition, settings);
}

// ============================================================================
// Settings Defaults
// ============================================================================

/**
 * Get default values for all settings in a schema
 */
export function getDefaultSettings(schema: SettingsSchema): Record<string, any> {
  const defaults: Record<string, any> = {};

  for (const [key, definition] of Object.entries(schema)) {
    if (definition.defaultValue !== undefined) {
      defaults[key] = definition.defaultValue;
    }
  }

  return defaults;
}

/**
 * Merge settings with defaults
 */
export function mergeWithDefaults(
  settings: Record<string, any>,
  schema: SettingsSchema,
): Record<string, any> {
  const defaults = getDefaultSettings(schema);
  return { ...defaults, ...settings };
}

// ============================================================================
// Settings Serialization
// ============================================================================

/**
 * Serialize settings for storage
 */
export function serializeSettings(settings: Record<string, any>): string {
  return JSON.stringify(settings, null, 2);
}

/**
 * Deserialize settings from storage
 */
export function deserializeSettings(data: string): Record<string, any> {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to deserialize settings: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// ============================================================================
// Settings Validation Schemas
// ============================================================================

/**
 * Common validation schemas for settings
 */
export const SettingValidationSchemas = {
  email: {
    type: "email" as const,
    required: true,
    errorMessage: "Must be a valid email address",
  },
  
  password: {
    type: "string" as const,
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
  },
  
  url: {
    type: "url" as const,
    required: true,
    errorMessage: "Must be a valid URL",
  },
  
  theme: {
    type: "string" as const,
    required: true,
    enum: ["light", "dark", "auto"],
    errorMessage: "Theme must be light, dark, or auto",
  },
  
  language: {
    type: "string" as const,
    required: true,
    minLength: 2,
    maxLength: 5,
    pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
    errorMessage: "Language must be a valid locale code (e.g., 'en' or 'en-US')",
  },
  
  port: {
    type: "number" as const,
    required: true,
    min: 1,
    max: 65535,
    errorMessage: "Port must be between 1 and 65535",
  },
  
  timeout: {
    type: "number" as const,
    required: true,
    min: 1000,
    max: 300000,
    errorMessage: "Timeout must be between 1 second and 5 minutes",
  },
} as const;