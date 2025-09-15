/**
 * Core validation utilities and engine
 */

import { ValidationError, type FieldValidationOptions, type ValidationResult, type ValidationSchema } from "./types.js";

// ============================================================================
// Core Validation Engine
// ============================================================================

export class ValidationUtils {
  /**
   * Validate a single value against a schema
   */
  static validateValue(
    value: unknown,
    schema: ValidationSchema,
    options: FieldValidationOptions = {}
  ): ValidationResult {
    const { fieldName = "field", context, strict = false } = options;
    const errors: string[] = [];

    // Check required
    if (schema.required && this.isEmpty(value)) {
      const error = schema.errorMessage || `${fieldName} is required`;
      if (context) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "required",
        });
      }
      return { isValid: false, error };
    }

    // Skip validation if value is empty and not required
    if (!schema.required && this.isEmpty(value)) {
      return { isValid: true };
    }

    // Type validation
    if (schema.type && !this.isValidType(value, schema.type)) {
      const error = `${fieldName} must be of type ${schema.type}`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "type",
        });
      }
      errors.push(error);
    }

    // Type-specific validation
    switch (schema.type) {
      case "string":
        this.validateString(value, fieldName, errors, schema);
        break;
      case "number":
        this.validateNumber(value, fieldName, errors, schema);
        break;
      case "email":
        this.validateEmail(value, fieldName, errors, schema);
        break;
      case "url":
        this.validateUrl(value, fieldName, errors, schema);
        break;
      case "date":
        this.validateDate(value, fieldName, errors, schema);
        break;
      case "phone":
        this.validatePhone(value, fieldName, errors, schema);
        break;
      case "ip":
        this.validateIP(value, fieldName, errors, schema);
        break;
      case "hex-color":
        this.validateHexColor(value, fieldName, errors, schema);
        break;
      case "username":
        this.validateUsername(value, fieldName, errors, schema);
        break;
      case "password":
        this.validatePassword(value, fieldName, errors, schema);
        break;
      case "api-key":
        this.validateApiKey(value, fieldName, errors, schema);
        break;
      case "token":
        this.validateToken(value, fieldName, errors, schema);
        break;
      case "filename":
        this.validateFilename(value, fieldName, errors, schema);
        break;
      case "mime-type":
        this.validateMimeType(value, fieldName, errors, schema);
        break;
      case "port":
        this.validatePort(value, fieldName, errors, schema);
        break;
      case "timeout":
        this.validateTimeout(value, fieldName, errors, schema);
        break;
      case "model-name":
        this.validateModelName(value, fieldName, errors, schema);
        break;
      case "prompt":
        this.validatePrompt(value, fieldName, errors, schema);
        break;
      case "temperature":
        this.validateTemperature(value, fieldName, errors, schema);
        break;
      case "max-tokens":
        this.validateMaxTokens(value, fieldName, errors, schema);
        break;
      case "theme":
        this.validateTheme(value, fieldName, errors, schema);
        break;
      case "language":
        this.validateLanguage(value, fieldName, errors, schema);
        break;
      case "color":
        this.validateColor(value, fieldName, errors, schema);
        break;
    }

    // Custom validator
    if (schema.customValidator) {
      const customResult = schema.customValidator(value);
      if (!customResult.isValid && customResult.error) {
        errors.push(customResult.error);
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      const error = `${fieldName} must be one of: ${schema.enum.join(", ")}`;
      errors.push(error);
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
      errors: errors.length > 0 ? errors : undefined,
      field: fieldName,
      value,
    };
  }

  /**
   * Validate multiple fields at once
   */
  static validateMultiple(
    data: Record<string, unknown>,
    schemas: Record<string, ValidationSchema>,
    options: FieldValidationOptions = {}
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    const validFields: string[] = [];
    const invalidFields: string[] = [];

    for (const [fieldName, value] of Object.entries(data)) {
      const schema = schemas[fieldName];
      if (!schema) continue;

      const result = this.validateValue(value, schema, {
        ...options,
        fieldName,
      });

      if (result.isValid) {
        validFields.push(fieldName);
      } else {
        invalidFields.push(fieldName);
        errors[fieldName] = result.errors || [result.error || "Invalid value"];
      }
    }

    return {
      isValid: invalidFields.length === 0,
      errors: errors,
      validFields,
      invalidFields,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private static isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
  }

  private static isValidType(value: unknown, type: string): boolean {
    switch (type) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !isNaN(value);
      case "boolean":
        return typeof value === "boolean";
      case "object":
        return typeof value === "object" && value !== null;
      case "array":
        return Array.isArray(value);
      case "email":
      case "url":
      case "date":
      case "phone":
      case "ip":
      case "hex-color":
      case "username":
      case "password":
      case "api-key":
      case "token":
      case "filename":
      case "mime-type":
      case "port":
      case "timeout":
      case "model-name":
      case "prompt":
      case "temperature":
      case "max-tokens":
      case "theme":
      case "language":
      case "color":
        return typeof value === "string";
      default:
        return true;
    }
  }

  // ============================================================================
  // Type-Specific Validators
  // ============================================================================

  private static validateString(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${fieldName} must be at least ${schema.minLength} characters long`);
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${fieldName} must be no more than ${schema.maxLength} characters long`);
    }

    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} format is invalid`);
    }
  }

  private static validateNumber(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "number" || isNaN(value)) return;

    if (schema.min !== undefined && value < schema.min) {
      errors.push(`${fieldName} must be at least ${schema.min}`);
    }

    if (schema.max !== undefined && value > schema.max) {
      errors.push(`${fieldName} must be no more than ${schema.max}`);
    }
  }

  private static validateEmail(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid email address`);
    }
  }

  private static validateUrl(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.push(schema.errorMessage || `${fieldName} must be a valid HTTP/HTTPS URL`);
      }
    } catch {
      errors.push(schema.errorMessage || `${fieldName} must be a valid URL`);
    }
  }

  private static validateDate(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid date`);
    }
  }

  private static validatePhone(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid phone number`);
    }
  }

  private static validateIP(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    if (!ipv4Regex.test(value) && !ipv6Regex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid IP address`);
    }
  }

  private static validateHexColor(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid hex color`);
    }
  }

  private static validateUsername(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(value)) {
      errors.push(
        schema.errorMessage ||
          `${fieldName} must be 3-30 characters with only letters, numbers, underscores, and hyphens`
      );
    }
  }

  private static validatePassword(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    if (value.length < 8) {
      errors.push(`${fieldName} must be at least 8 characters long`);
    }

    if (value.length > 128) {
      errors.push(`${fieldName} must be no more than 128 characters long`);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(value)) {
      errors.push(
        schema.errorMessage || `${fieldName} must contain uppercase, lowercase, number, and special character`
      );
    }
  }

  private static validateApiKey(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    if (value.length < 10 || value.length > 256) {
      errors.push(`${fieldName} must be 10-256 characters long`);
    }

    const apiKeyRegex = /^[a-zA-Z0-9_-]+$/;
    if (!apiKeyRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must contain only letters, numbers, underscores, and hyphens`);
    }
  }

  private static validateToken(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    if (value.length < 20 || value.length > 512) {
      errors.push(schema.errorMessage || `${fieldName} must be 20-512 characters long`);
    }
  }

  private static validateFilename(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const filenameRegex = /^[^<>:"/\\|?*\x00-\x1f]+$/;
    if (!filenameRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} cannot contain invalid characters`);
    }
  }

  private static validateMimeType(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const mimeTypeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/;
    if (!mimeTypeRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid MIME type`);
    }
  }

  private static validatePort(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "number") return;

    if (value < 1 || value > 65535) {
      errors.push(schema.errorMessage || `${fieldName} must be between 1 and 65535`);
    }
  }

  private static validateTimeout(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "number") return;

    if (value < 1000 || value > 300000) {
      errors.push(schema.errorMessage || `${fieldName} must be between 1 second and 5 minutes`);
    }
  }

  private static validateModelName(
    value: unknown,
    fieldName: string,
    errors: string[],
    schema: ValidationSchema
  ): void {
    if (typeof value !== "string") return;

    const modelNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!modelNameRegex.test(value)) {
      errors.push(
        schema.errorMessage || `${fieldName} must contain only letters, numbers, dots, underscores, and hyphens`
      );
    }
  }

  private static validatePrompt(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    if (value.length < 1 || value.length > 10000) {
      errors.push(schema.errorMessage || `${fieldName} must be 1-10000 characters`);
    }
  }

  private static validateTemperature(
    value: unknown,
    fieldName: string,
    errors: string[],
    schema: ValidationSchema
  ): void {
    if (typeof value !== "number") return;

    if (value < 0 || value > 2) {
      errors.push(schema.errorMessage || `${fieldName} must be between 0 and 2`);
    }
  }

  private static validateMaxTokens(
    value: unknown,
    fieldName: string,
    errors: string[],
    schema: ValidationSchema
  ): void {
    if (typeof value !== "number") return;

    if (value < 1 || value > 100000) {
      errors.push(schema.errorMessage || `${fieldName} must be between 1 and 100000`);
    }
  }

  private static validateTheme(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const validThemes = ["light", "dark", "auto"];
    if (!validThemes.includes(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be light, dark, or auto`);
    }
  }

  private static validateLanguage(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const languageRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!languageRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid locale code (e.g., 'en' or 'en-US')`);
    }
  }

  private static validateColor(value: unknown, fieldName: string, errors: string[], schema: ValidationSchema): void {
    if (typeof value !== "string") return;

    const colorRegex =
      /^#[0-9A-Fa-f]{6}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
    if (!colorRegex.test(value)) {
      errors.push(schema.errorMessage || `${fieldName} must be a valid hex, RGB, or HSL color`);
    }
  }
}
