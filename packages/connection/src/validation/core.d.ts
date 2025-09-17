/**
 * Core Validation System
 *
 * The foundation of the Reynard validation system, providing
 * base types, interfaces, and core validation logic.
 */
import { ValidationErrorContext } from "../errors/core";
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
    items?: ValidationSchema;
    properties?: Record<string, ValidationSchema>;
    errorMessage?: string;
    customValidator?: (value: unknown) => ValidationResult;
}
export interface FieldValidationOptions {
    fieldName?: string;
    context?: ValidationErrorContext;
    strict?: boolean;
    allowEmpty?: boolean;
}
export declare class ValidationUtils {
    /**
     * Validate a single value against a schema
     */
    static validateValue(value: unknown, schema: ValidationSchema, options?: FieldValidationOptions): ValidationResult;
    /**
     * Validate multiple fields at once
     */
    static validateMultiple(data: Record<string, unknown>, schemas: Record<string, ValidationSchema>, options?: FieldValidationOptions): MultiValidationResult;
    private static isEmpty;
    private static isValidType;
    private static validateString;
    private static validateNumber;
    private static validateArray;
    private static validateObject;
    private static validateEmail;
    private static validateUrl;
    private static validateDate;
}
