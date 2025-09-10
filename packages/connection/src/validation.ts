/**
 * Consolidated Validation System for Reynard Framework
 * 
 * This module provides unified validation patterns that eliminate
 * duplication across Reynard packages. It consolidates validation
 * logic, schemas, and utilities from multiple packages.
 */

import { ValidationError, ValidationErrorContext } from "./errors";

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
    type: "string" | "number" | "boolean" | "object" | "array" | "email" | "url" | "date";
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
                this.validateString(value as string, schema, fieldName, errors, context, strict);
                break;
            case "number":
                this.validateNumber(value as number, schema, fieldName, errors, context, strict);
                break;
            case "array":
                this.validateArray(value as unknown[], schema, fieldName, errors, context, strict);
                break;
            case "object":
                this.validateObject(value as Record<string, unknown>, schema, fieldName, errors, context, strict);
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
        if (schema.pattern && typeof value === "string" && !schema.pattern.test(value)) {
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
     * Validate multiple values against a schema
     */
    static validateMultiple(
        values: Record<string, unknown>,
        schema: Record<string, ValidationSchema>,
        context?: ValidationErrorContext
    ): MultiValidationResult {
        const results: Record<string, ValidationResult> = {};
        const errors: string[] = [];
        const warnings: string[] = [];

        for (const [fieldName, fieldSchema] of Object.entries(schema)) {
            try {
                const result = this.validateValue(values[fieldName], fieldSchema, {
                    fieldName,
                    context,
                    strict: false,
                });
                results[fieldName] = result;

                if (!result.isValid && result.error) {
                    errors.push(result.error);
                }
                if (result.warnings) {
                    warnings.push(...result.warnings);
                }
            } catch (error) {
                if (error instanceof ValidationError) {
                    results[fieldName] = {
                        isValid: false,
                        error: error.message,
                        field: fieldName,
                        value: values[fieldName],
                    };
                    errors.push(error.message);
                } else {
                    const errorMessage = `Validation failed for ${fieldName}`;
                    results[fieldName] = {
                        isValid: false,
                        error: errorMessage,
                        field: fieldName,
                        value: values[fieldName],
                    };
                    errors.push(errorMessage);
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
    // Private Helper Methods
    // ============================================================================

    private static isEmpty(value: unknown): boolean {
        return value === undefined || value === null || value === "";
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
        strict = false
    ): void {
        if (typeof value !== "string") return;

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
        strict = false
    ): void {
        if (typeof value !== "number" || isNaN(value)) return;

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
            const error = `${fieldName} must be at most ${schema.max}`;
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
        strict = false
    ): void {
        if (!Array.isArray(value)) return;

        if (schema.minLength !== undefined && value.length < schema.minLength) {
            const error = `${fieldName} must have at least ${schema.minLength} items`;
            if (context && strict) {
                throw new ValidationError(error, {
                    ...context,
                    field: fieldName,
                    value,
                    constraint: "minItems",
                });
            }
            errors.push(error);
        }

        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
            const error = `${fieldName} must have at most ${schema.maxLength} items`;
            if (context && strict) {
                throw new ValidationError(error, {
                    ...context,
                    field: fieldName,
                    value,
                    constraint: "maxItems",
                });
            }
            errors.push(error);
        }

        // Validate array items if schema provided
        if (schema.items) {
            value.forEach((item, index) => {
                const itemResult = this.validateValue(item, schema.items!, {
                    fieldName: `${fieldName}[${index}]`,
                    context,
                    strict: false,
                });
                if (!itemResult.isValid && itemResult.error) {
                    errors.push(itemResult.error);
                }
            });
        }
    }

    private static validateObject(
        value: Record<string, unknown>,
        schema: ValidationSchema,
        fieldName: string,
        errors: string[],
        context?: ValidationErrorContext,
        strict = false
    ): void {
        if (typeof value !== "object" || value === null || Array.isArray(value)) return;

        // Validate object properties if schema provided
        if (schema.properties) {
            for (const [propName, propSchema] of Object.entries(schema.properties)) {
                const propResult = this.validateValue(value[propName], propSchema, {
                    fieldName: `${fieldName}.${propName}`,
                    context,
                    strict: false,
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
        strict = false
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
        strict = false
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
        strict = false
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

// ============================================================================
// Common Validation Schemas
// ============================================================================

export const CommonSchemas = {
    email: {
        type: "email" as const,
        required: true,
        errorMessage: "Please enter a valid email address",
    },

    password: {
        type: "string" as const,
        required: true,
        minLength: 8,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
    },

    username: {
        type: "string" as const,
        required: true,
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        errorMessage: "Username must be 3-30 characters with only letters, numbers, hyphens, and underscores",
    },

    url: {
        type: "url" as const,
        required: true,
        errorMessage: "Please enter a valid URL",
    },

    positiveNumber: {
        type: "number" as const,
        required: true,
        min: 0,
        errorMessage: "Must be a positive number",
    },

    nonEmptyString: {
        type: "string" as const,
        required: true,
        minLength: 1,
        errorMessage: "This field cannot be empty",
    },
};

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Validate a single value
 */
export function validateValue(
    value: unknown,
    schema: ValidationSchema,
    options?: FieldValidationOptions
): ValidationResult {
    return ValidationUtils.validateValue(value, schema, options);
}

/**
 * Validate multiple values
 */
export function validateMultiple(
    values: Record<string, unknown>,
    schema: Record<string, ValidationSchema>,
    context?: ValidationErrorContext
): MultiValidationResult {
    return ValidationUtils.validateMultiple(values, schema, context);
}

/**
 * Validate email address
 */
export function validateEmail(email: string, fieldName = "email"): ValidationResult {
    return validateValue(email, CommonSchemas.email, { fieldName });
}

/**
 * Validate password
 */
export function validatePassword(password: string, fieldName = "password"): ValidationResult {
    return validateValue(password, CommonSchemas.password, { fieldName });
}

/**
 * Validate username
 */
export function validateUsername(username: string, fieldName = "username"): ValidationResult {
    return validateValue(username, CommonSchemas.username, { fieldName });
}

/**
 * Validate URL
 */
export function validateUrl(url: string, fieldName = "url"): ValidationResult {
    return validateValue(url, CommonSchemas.url, { fieldName });
}
