/**
 * Validation Middleware System
 *
 * Middleware system for extending validation functionality with custom
 * business logic, cross-field validation, and domain-specific rules.
 */
import { ValidationResult, ValidationSchema } from "./core";
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
    multiple?: (results: Record<string, ValidationResult>, data: Record<string, unknown>) => Record<string, ValidationResult>;
}
export interface ValidationContext {
    fieldName: string;
    schema: ValidationSchema;
    value: unknown;
    data?: Record<string, unknown>;
    middleware: ValidationMiddleware[];
}
export declare class ValidationMiddlewareSystem {
    private middleware;
    /**
     * Add middleware to the system
     */
    add(middleware: ValidationMiddleware): void;
    /**
     * Remove middleware from the system
     */
    remove(middleware: ValidationMiddleware): void;
    /**
     * Clear all middleware
     */
    clear(): void;
    /**
     * Validate a single value with middleware
     */
    validate(value: unknown, schema: ValidationSchema, fieldName: string, data?: Record<string, unknown>): ValidationResult;
    /**
     * Validate multiple fields with middleware
     */
    validateMultiple(data: Record<string, unknown>, schemas: Record<string, ValidationSchema>): Record<string, ValidationResult>;
}
/**
 * Middleware for cross-field validation
 */
export declare function createCrossFieldMiddleware(validator: (data: Record<string, unknown>) => ValidationResult): ValidationMiddleware;
/**
 * Middleware for conditional validation
 */
export declare function createConditionalMiddleware(condition: (data: Record<string, unknown>) => boolean, schema: ValidationSchema): ValidationMiddleware;
/**
 * Middleware for sanitization
 */
export declare function createSanitizationMiddleware(sanitizer: (value: unknown, fieldName: string) => unknown): ValidationMiddleware;
/**
 * Middleware for logging validation results
 */
export declare function createLoggingMiddleware(logger: (result: ValidationResult, fieldName: string) => void): ValidationMiddleware;
/**
 * Middleware for custom business rules
 */
export declare function createBusinessRuleMiddleware(rule: (value: unknown, fieldName: string, data?: Record<string, unknown>) => ValidationResult | null): ValidationMiddleware;
/**
 * Password confirmation validation
 */
export declare const passwordConfirmationMiddleware: ValidationMiddleware;
/**
 * Email confirmation validation
 */
export declare const emailConfirmationMiddleware: ValidationMiddleware;
/**
 * Date range validation
 */
export declare const dateRangeMiddleware: ValidationMiddleware;
/**
 * Numeric range validation
 */
export declare const numericRangeMiddleware: ValidationMiddleware;
/**
 * Trim string values
 */
export declare const trimSanitization: ValidationMiddleware;
/**
 * Convert to lowercase
 */
export declare const lowercaseSanitization: ValidationMiddleware;
/**
 * Convert to uppercase
 */
export declare const uppercaseSanitization: ValidationMiddleware;
/**
 * Remove HTML tags
 */
export declare const htmlSanitization: ValidationMiddleware;
/**
 * Global validation middleware system
 */
export declare const globalValidationMiddleware: ValidationMiddlewareSystem;
