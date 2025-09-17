/**
 * Validation Middleware System
 *
 * Middleware system for extending validation functionality with custom
 * business logic, cross-field validation, and domain-specific rules.
 */

import { ValidationResult, ValidationSchema, ValidationUtils } from "./core";

// ============================================================================
// Middleware Types
// ============================================================================

export interface ValidationMiddleware {
  /**
   * Process validation before the main validation logic
   */
  before?: (value: unknown, schema: ValidationSchema, fieldName: string) => ValidationResult | null;

  /**
   * Process validation after the main validation logic
   */
  after?: (result: ValidationResult, value: unknown, schema: ValidationSchema, fieldName: string) => ValidationResult;

  /**
   * Process multiple field validation
   */
  multiple?: (
    results: Record<string, ValidationResult>,
    data: Record<string, unknown>
  ) => Record<string, ValidationResult>;
}

export interface ValidationContext {
  fieldName: string;
  schema: ValidationSchema;
  value: unknown;
  data?: Record<string, unknown>;
  middleware: ValidationMiddleware[];
}

// ============================================================================
// Middleware System
// ============================================================================

export class ValidationMiddlewareSystem {
  private middleware: ValidationMiddleware[] = [];

  /**
   * Add middleware to the system
   */
  add(middleware: ValidationMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Remove middleware from the system
   */
  remove(middleware: ValidationMiddleware): void {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }

  /**
   * Clear all middleware
   */
  clear(): void {
    this.middleware = [];
  }

  /**
   * Validate a single value with middleware
   */
  validate(
    value: unknown,
    schema: ValidationSchema,
    fieldName: string,
    data?: Record<string, unknown>
  ): ValidationResult {
    const context: ValidationContext = {
      fieldName,
      schema,
      value,
      data,
      middleware: this.middleware,
    };

    // Run before middleware
    for (const middleware of this.middleware) {
      if (middleware.before) {
        const result = middleware.before(value, schema, fieldName);
        if (result && !result.isValid) {
          return result;
        }
      }
    }

    // Run main validation
    let result = ValidationUtils.validateValue(value, schema, { fieldName });

    // Run after middleware
    for (const middleware of this.middleware) {
      if (middleware.after) {
        result = middleware.after(result, value, schema, fieldName);
      }
    }

    return result;
  }

  /**
   * Validate multiple fields with middleware
   */
  validateMultiple(
    data: Record<string, unknown>,
    schemas: Record<string, ValidationSchema>
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    // Validate each field
    for (const [fieldName, schema] of Object.entries(schemas)) {
      results[fieldName] = this.validate(data[fieldName], schema, fieldName, data);
    }

    // Run multiple field middleware
    for (const middleware of this.middleware) {
      if (middleware.multiple) {
        const processedResults = middleware.multiple(results, data);
        Object.assign(results, processedResults);
      }
    }

    return results;
  }
}

// ============================================================================
// Built-in Middleware
// ============================================================================

/**
 * Middleware for cross-field validation
 */
export function createCrossFieldMiddleware(
  validator: (data: Record<string, unknown>) => ValidationResult
): ValidationMiddleware {
  return {
    multiple: (results, data) => {
      const crossFieldResult = validator(data);
      if (!crossFieldResult.isValid) {
        // Apply the error to the first field or a specific field
        const targetField = crossFieldResult.field || Object.keys(results)[0];
        if (targetField && results[targetField]) {
          results[targetField] = {
            ...results[targetField],
            isValid: false,
            error: crossFieldResult.error,
            warnings: [...(results[targetField].warnings || []), ...(crossFieldResult.warnings || [])],
          };
        }
      }
      return results;
    },
  };
}

/**
 * Middleware for conditional validation
 */
export function createConditionalMiddleware(
  condition: (data: Record<string, unknown>) => boolean,
  schema: ValidationSchema
): ValidationMiddleware {
  return {
    before: (value, originalSchema, fieldName) => {
      // This would need access to the full data context
      // For now, we'll implement this in the multiple validation
      return null;
    },
    multiple: (results, data) => {
      if (condition(data)) {
        // Apply conditional schema validation
        for (const [fieldName, result] of Object.entries(results)) {
          if (result.isValid) {
            const conditionalResult = ValidationUtils.validateValue(data[fieldName], schema, { fieldName });
            if (!conditionalResult.isValid) {
              results[fieldName] = conditionalResult;
            }
          }
        }
      }
      return results;
    },
  };
}

/**
 * Middleware for sanitization
 */
export function createSanitizationMiddleware(
  sanitizer: (value: unknown, fieldName: string) => unknown
): ValidationMiddleware {
  return {
    before: (value, schema, fieldName) => {
      const sanitizedValue = sanitizer(value, fieldName);
      // Update the value in the context (this would need to be passed through)
      return null;
    },
  };
}

/**
 * Middleware for logging validation results
 */
export function createLoggingMiddleware(
  logger: (result: ValidationResult, fieldName: string) => void
): ValidationMiddleware {
  return {
    after: (result, value, schema, fieldName) => {
      logger(result, fieldName);
      return result;
    },
  };
}

/**
 * Middleware for custom business rules
 */
export function createBusinessRuleMiddleware(
  rule: (value: unknown, fieldName: string, data?: Record<string, unknown>) => ValidationResult | null
): ValidationMiddleware {
  return {
    before: (value, schema, fieldName) => {
      return rule(value, fieldName);
    },
  };
}

// ============================================================================
// Common Business Rules
// ============================================================================

/**
 * Password confirmation validation
 */
export const passwordConfirmationMiddleware = createCrossFieldMiddleware(data => {
  const password = data.password;
  const confirmPassword = data.confirmPassword;

  if (password && confirmPassword && password !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match",
      field: "confirmPassword",
    };
  }

  return { isValid: true };
});

/**
 * Email confirmation validation
 */
export const emailConfirmationMiddleware = createCrossFieldMiddleware(data => {
  const email = data.email;
  const confirmEmail = data.confirmEmail;

  if (email && confirmEmail && email !== confirmEmail) {
    return {
      isValid: false,
      error: "Email addresses do not match",
      field: "confirmEmail",
    };
  }

  return { isValid: true };
});

/**
 * Date range validation
 */
export const dateRangeMiddleware = createCrossFieldMiddleware(data => {
  const startDate = data.startDate;
  const endDate = data.endDate;

  if (startDate && endDate && typeof startDate === "string" && typeof endDate === "string") {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return {
        isValid: false,
        error: "End date must be after start date",
        field: "endDate",
      };
    }
  }

  return { isValid: true };
});

/**
 * Numeric range validation
 */
export const numericRangeMiddleware = createCrossFieldMiddleware(data => {
  const min = data.min;
  const max = data.max;

  if (min !== undefined && max !== undefined && typeof min === "number" && typeof max === "number" && min >= max) {
    return {
      isValid: false,
      error: "Maximum value must be greater than minimum value",
      field: "max",
    };
  }

  return { isValid: true };
});

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Trim string values
 */
export const trimSanitization = createSanitizationMiddleware((value, fieldName) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
});

/**
 * Convert to lowercase
 */
export const lowercaseSanitization = createSanitizationMiddleware((value, fieldName) => {
  if (typeof value === "string") {
    return value.toLowerCase();
  }
  return value;
});

/**
 * Convert to uppercase
 */
export const uppercaseSanitization = createSanitizationMiddleware((value, fieldName) => {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value;
});

/**
 * Remove HTML tags
 */
export const htmlSanitization = createSanitizationMiddleware((value, fieldName) => {
  if (typeof value === "string") {
    return value.replace(/<[^>]*>/g, "");
  }
  return value;
});

// ============================================================================
// Global Middleware Instance
// ============================================================================

/**
 * Global validation middleware system
 */
export const globalValidationMiddleware = new ValidationMiddlewareSystem();

// Add common middleware by default
globalValidationMiddleware.add(trimSanitization);
globalValidationMiddleware.add(htmlSanitization);
