/**
 * Common Validation Schemas
 *
 * Pre-defined validation schemas for common data types and patterns
 * used throughout the Reynard framework.
 */
import { ValidationSchema } from "./core";
export declare const emailSchema: ValidationSchema;
export declare const passwordSchema: ValidationSchema;
export declare const usernameSchema: ValidationSchema;
export declare const urlSchema: ValidationSchema;
export declare const optionalUrlSchema: ValidationSchema;
export declare const apiKeySchema: ValidationSchema;
export declare const tokenSchema: ValidationSchema;
export declare const fileNameSchema: ValidationSchema;
export declare const mimeTypeSchema: ValidationSchema;
export declare const fileSizeSchema: ValidationSchema;
export declare const portSchema: ValidationSchema;
export declare const timeoutSchema: ValidationSchema;
export declare const retryCountSchema: ValidationSchema;
export declare const modelNameSchema: ValidationSchema;
export declare const promptSchema: ValidationSchema;
export declare const temperatureSchema: ValidationSchema;
export declare const maxTokensSchema: ValidationSchema;
export declare const themeSchema: ValidationSchema;
export declare const languageSchema: ValidationSchema;
export declare const colorSchema: ValidationSchema;
/**
 * Create a schema with custom error message
 */
export declare function createSchema(baseSchema: ValidationSchema, customErrorMessage?: string): ValidationSchema;
/**
 * Create an optional version of a schema
 */
export declare function makeOptional(schema: ValidationSchema): ValidationSchema;
/**
 * Create a required version of a schema
 */
export declare function makeRequired(schema: ValidationSchema): ValidationSchema;
/**
 * Create a schema with custom length constraints
 */
export declare function withLength(schema: ValidationSchema, minLength?: number, maxLength?: number): ValidationSchema;
/**
 * Create a schema with custom numeric constraints
 */
export declare function withRange(schema: ValidationSchema, min?: number, max?: number): ValidationSchema;
