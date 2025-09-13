/**
 * Core Validation System
 *
 * The foundation of the Reynard validation system, providing
 * base types, interfaces, and core validation logic.
 */

import { ValidationError, ValidationErrorContext } from "../errors/core";

// ============================================================================
// Core Validation Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  field?: string;
  value?: unknown;
}

export interface MultiValidationResult {
  isValid: boolean;
  results: Record<string, ValidationResult>;
  errors: string[];
  warnings: string[];
}

export interface ValidationSchema {
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
  items?: ValidationSchema; // For arrays
  properties?: Record<string, ValidationSchema>; // For objects
  errorMessage?: string;
  customValidator?: (value: unknown) => ValidationResult;
}

export interface FieldValidationOptions {
  fieldName?: string;
  context?: ValidationErrorContext;
  strict?: boolean;
  allowEmpty?: boolean;
}

// ============================================================================
// Validation Utilities
// ============================================================================

export class ValidationUtils {
  /**
   * Validate a single value against a schema
   */
  static validateValue(
    value: unknown,
    schema: ValidationSchema,
    options: FieldValidationOptions = {},
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
        this.validateString(
          value as string,
          schema,
          fieldName,
          errors,
          context,
          strict,
        );
        break;
      case "number":
        this.validateNumber(
          value as number,
          schema,
          fieldName,
          errors,
          context,
          strict,
        );
        break;
      case "array":
        this.validateArray(
          value as unknown[],
          schema,
          fieldName,
          errors,
          context,
          strict,
        );
        break;
      case "object":
        this.validateObject(
          value as Record<string, unknown>,
          schema,
          fieldName,
          errors,
          context,
          strict,
        );
        break;
      case "email":
        this.validateEmail(value as string, fieldName, errors, context, strict);
        break;
      case "url":
        this.validateUrl(value as string, fieldName, errors, context, strict);
        break;
      case "date":
        this.validateDate(value, fieldName, errors, context, strict);
        break;
    }

    // Pattern validation
    if (
      schema.pattern &&
      typeof value === "string" &&
      !schema.pattern.test(value)
    ) {
      const error = schema.errorMessage || `${fieldName} format is invalid`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "pattern",
        });
      }
      errors.push(error);
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      const error = `${fieldName} must be one of: ${schema.enum.join(", ")}`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "enum",
        });
      }
      errors.push(error);
    }

    // Custom validator
    if (schema.customValidator) {
      const customResult = schema.customValidator(value);
      if (!customResult.isValid) {
        if (context && strict) {
          throw new ValidationError(customResult.error || "Custom validation failed", {
            ...context,
            field: fieldName,
            value,
            constraint: "custom",
          });
        }
        errors.push(customResult.error || "Custom validation failed");
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
      warnings: errors.slice(1),
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
    options: FieldValidationOptions = {},
  ): MultiValidationResult {
    const results: Record<string, ValidationResult> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [fieldName, schema] of Object.entries(schemas)) {
      const result = this.validateValue(data[fieldName], schema, {
        ...options,
        fieldName,
      });
      results[fieldName] = result;

      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
      if (result.warnings) {
        warnings.push(...result.warnings);
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
  // Helper Methods
  // ============================================================================

  private static isEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
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
        return typeof value === "object" && value !== null && !Array.isArray(value);
      case "array":
        return Array.isArray(value);
      case "email":
        return typeof value === "string";
      case "url":
        return typeof value === "string";
      case "date":
        return value instanceof Date || typeof value === "string";
      default:
        return false;
    }
  }

  private static validateString(
    value: string,
    schema: ValidationSchema,
    fieldName: string,
    errors: string[],
    context?: ValidationErrorContext,
    strict = false,
  ): void {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      const error = `${fieldName} must be at least ${schema.minLength} characters`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "minLength",
        });
      }
      errors.push(error);
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      const error = `${fieldName} must be no more than ${schema.maxLength} characters`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "maxLength",
        });
      }
      errors.push(error);
    }
  }

  private static validateNumber(
    value: number,
    schema: ValidationSchema,
    fieldName: string,
    errors: string[],
    context?: ValidationErrorContext,
    strict = false,
  ): void {
    if (schema.min !== undefined && value < schema.min) {
      const error = `${fieldName} must be at least ${schema.min}`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "min",
        });
      }
      errors.push(error);
    }

    if (schema.max !== undefined && value > schema.max) {
      const error = `${fieldName} must be no more than ${schema.max}`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "max",
        });
      }
      errors.push(error);
    }
  }

  private static validateArray(
    value: unknown[],
    schema: ValidationSchema,
    fieldName: string,
    errors: string[],
    context?: ValidationErrorContext,
    strict = false,
  ): void {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      const error = `${fieldName} must have at least ${schema.minLength} items`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "minLength",
        });
      }
      errors.push(error);
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      const error = `${fieldName} must have no more than ${schema.maxLength} items`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "maxLength",
        });
      }
      errors.push(error);
    }

    // Validate array items if schema is provided
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        const itemResult = this.validateValue(value[i], schema.items, {
          fieldName: `${fieldName}[${i}]`,
          context,
          strict,
        });
        if (!itemResult.isValid && itemResult.error) {
          errors.push(itemResult.error);
        }
      }
    }
  }

  private static validateObject(
    value: Record<string, unknown>,
    schema: ValidationSchema,
    fieldName: string,
    errors: string[],
    context?: ValidationErrorContext,
    strict = false,
  ): void {
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propResult = this.validateValue(value[propName], propSchema, {
          fieldName: `${fieldName}.${propName}`,
          context,
          strict,
        });
        if (!propResult.isValid && propResult.error) {
          errors.push(propResult.error);
        }
      }
    }
  }

  private static validateEmail(
    value: string,
    fieldName: string,
    errors: string[],
    context?: ValidationErrorContext,
    strict = false,
  ): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      const error = `${fieldName} must be a valid email address`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "email",
        });
      }
      errors.push(error);
    }
  }

  private static validateUrl(
    value: string,
    fieldName: string,
    errors: string[],
    context?: ValidationErrorContext,
    strict = false,
  ): void {
    try {
      new URL(value);
    } catch {
      const error = `${fieldName} must be a valid URL`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "url",
        });
      }
      errors.push(error);
    }
  }

  private static validateDate(
    value: unknown,
    fieldName: string,
    errors: string[],
    context?: ValidationErrorContext,
    strict = false,
  ): void {
    let date: Date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      date = new Date(value);
    } else {
      const error = `${fieldName} must be a valid date`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "date",
        });
      }
      errors.push(error);
      return;
    }

    if (isNaN(date.getTime())) {
      const error = `${fieldName} must be a valid date`;
      if (context && strict) {
        throw new ValidationError(error, {
          ...context,
          field: fieldName,
          value,
          constraint: "date",
        });
      }
      errors.push(error);
    }
  }
}
