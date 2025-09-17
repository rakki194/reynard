/**
 * Common Validation Schemas
 *
 * Pre-defined validation schemas for common data types and patterns
 * used throughout the Reynard framework.
 */
// ============================================================================
// Common Field Schemas
// ============================================================================
export const emailSchema = {
    type: "email",
    required: true,
    errorMessage: "Must be a valid email address",
};
export const passwordSchema = {
    type: "string",
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
};
export const usernameSchema = {
    type: "string",
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    errorMessage: "Username must be 3-30 characters with only letters, numbers, underscores, and hyphens",
};
export const urlSchema = {
    type: "url",
    required: true,
    errorMessage: "Must be a valid URL",
};
export const optionalUrlSchema = {
    type: "url",
    required: false,
    errorMessage: "Must be a valid URL",
};
// ============================================================================
// API Schemas
// ============================================================================
export const apiKeySchema = {
    type: "string",
    required: true,
    minLength: 10,
    maxLength: 256,
    pattern: /^[a-zA-Z0-9_-]+$/,
    errorMessage: "API key must be 10-256 characters with only letters, numbers, underscores, and hyphens",
};
export const tokenSchema = {
    type: "string",
    required: true,
    minLength: 20,
    maxLength: 512,
    errorMessage: "Token must be 20-512 characters",
};
// ============================================================================
// File and Media Schemas
// ============================================================================
export const fileNameSchema = {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 255,
    pattern: /^[^<>:"/\\|?*\x00-\x1f]+$/,
    errorMessage: "Filename cannot contain invalid characters",
};
export const mimeTypeSchema = {
    type: "string",
    required: true,
    pattern: /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/,
    errorMessage: "Must be a valid MIME type",
};
export const fileSizeSchema = {
    type: "number",
    required: true,
    min: 0,
    max: 100 * 1024 * 1024, // 100MB
    errorMessage: "File size must be between 0 and 100MB",
};
// ============================================================================
// Configuration Schemas
// ============================================================================
export const portSchema = {
    type: "number",
    required: true,
    min: 1,
    max: 65535,
    errorMessage: "Port must be between 1 and 65535",
};
export const timeoutSchema = {
    type: "number",
    required: true,
    min: 1000,
    max: 300000, // 5 minutes
    errorMessage: "Timeout must be between 1 second and 5 minutes",
};
export const retryCountSchema = {
    type: "number",
    required: true,
    min: 0,
    max: 10,
    errorMessage: "Retry count must be between 0 and 10",
};
// ============================================================================
// AI/ML Schemas
// ============================================================================
export const modelNameSchema = {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9._-]+$/,
    errorMessage: "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens",
};
export const promptSchema = {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 10000,
    errorMessage: "Prompt must be 1-10000 characters",
};
export const temperatureSchema = {
    type: "number",
    required: true,
    min: 0,
    max: 2,
    errorMessage: "Temperature must be between 0 and 2",
};
export const maxTokensSchema = {
    type: "number",
    required: true,
    min: 1,
    max: 100000,
    errorMessage: "Max tokens must be between 1 and 100000",
};
// ============================================================================
// UI/UX Schemas
// ============================================================================
export const themeSchema = {
    type: "string",
    required: true,
    enum: ["light", "dark", "auto"],
    errorMessage: "Theme must be light, dark, or auto",
};
export const languageSchema = {
    type: "string",
    required: true,
    minLength: 2,
    maxLength: 5,
    pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
    errorMessage: "Language must be a valid locale code (e.g., 'en' or 'en-US')",
};
export const colorSchema = {
    type: "string",
    required: true,
    pattern: /^#[0-9A-Fa-f]{6}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
    errorMessage: "Color must be a valid hex, RGB, or HSL color",
};
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Create a schema with custom error message
 */
export function createSchema(baseSchema, customErrorMessage) {
    return {
        ...baseSchema,
        errorMessage: customErrorMessage || baseSchema.errorMessage,
    };
}
/**
 * Create an optional version of a schema
 */
export function makeOptional(schema) {
    return {
        ...schema,
        required: false,
    };
}
/**
 * Create a required version of a schema
 */
export function makeRequired(schema) {
    return {
        ...schema,
        required: true,
    };
}
/**
 * Create a schema with custom length constraints
 */
export function withLength(schema, minLength, maxLength) {
    return {
        ...schema,
        minLength,
        maxLength,
    };
}
/**
 * Create a schema with custom numeric constraints
 */
export function withRange(schema, min, max) {
    return {
        ...schema,
        min,
        max,
    };
}
