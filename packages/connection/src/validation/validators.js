/**
 * Common Validation Functions
 *
 * Convenience functions for common validation patterns used throughout
 * the Reynard framework. These functions provide simple, direct validation
 * without requiring schema objects.
 */
import { ValidationUtils } from "./core";
// ============================================================================
// Basic Field Validators
// ============================================================================
/**
 * Validate an email address
 */
export function validateEmail(email, fieldName = "email") {
    return ValidationUtils.validateValue(email, {
        type: "email",
        required: true,
        errorMessage: "Must be a valid email address",
    }, { fieldName });
}
/**
 * Validate a password
 */
export function validatePassword(password, fieldName = "password") {
    return ValidationUtils.validateValue(password, {
        type: "string",
        required: true,
        minLength: 8,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        errorMessage: "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
    }, { fieldName });
}
/**
 * Validate a username
 */
export function validateUsername(username, fieldName = "username") {
    return ValidationUtils.validateValue(username, {
        type: "string",
        required: true,
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        errorMessage: "Username must be 3-30 characters with only letters, numbers, underscores, and hyphens",
    }, { fieldName });
}
/**
 * Validate a URL
 */
export function validateUrl(url, fieldName = "url") {
    return ValidationUtils.validateValue(url, {
        type: "url",
        required: true,
        errorMessage: "Must be a valid URL",
    }, { fieldName });
}
/**
 * Validate any value against a schema
 */
export function validateValue(value, schema, fieldName = "field") {
    return ValidationUtils.validateValue(value, schema, { fieldName });
}
// ============================================================================
// API Validators
// ============================================================================
/**
 * Validate an API key
 */
export function validateApiKey(apiKey, fieldName = "apiKey") {
    return ValidationUtils.validateValue(apiKey, {
        type: "string",
        required: true,
        minLength: 10,
        maxLength: 256,
        pattern: /^[a-zA-Z0-9_-]+$/,
        errorMessage: "API key must be 10-256 characters with only letters, numbers, underscores, and hyphens",
    }, { fieldName });
}
/**
 * Validate an authentication token
 */
export function validateToken(token, fieldName = "token") {
    return ValidationUtils.validateValue(token, {
        type: "string",
        required: true,
        minLength: 20,
        maxLength: 512,
        errorMessage: "Token must be 20-512 characters",
    }, { fieldName });
}
// ============================================================================
// File and Media Validators
// ============================================================================
/**
 * Validate a filename
 */
export function validateFileName(fileName, fieldName = "fileName") {
    return ValidationUtils.validateValue(fileName, {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 255,
        pattern: /^[^<>:"/\\|?*\x00-\x1f]+$/,
        errorMessage: "Filename cannot contain invalid characters",
    }, { fieldName });
}
/**
 * Validate a MIME type
 */
export function validateMimeType(mimeType, fieldName = "mimeType") {
    return ValidationUtils.validateValue(mimeType, {
        type: "string",
        required: true,
        pattern: /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/,
        errorMessage: "Must be a valid MIME type",
    }, { fieldName });
}
/**
 * Validate file size
 */
export function validateFileSize(fileSize, fieldName = "fileSize", maxSize = 100 * 1024 * 1024) {
    return ValidationUtils.validateValue(fileSize, {
        type: "number",
        required: true,
        min: 0,
        max: maxSize,
        errorMessage: `File size must be between 0 and ${Math.round(maxSize / 1024 / 1024)}MB`,
    }, { fieldName });
}
// ============================================================================
// Configuration Validators
// ============================================================================
/**
 * Validate a port number
 */
export function validatePort(port, fieldName = "port") {
    return ValidationUtils.validateValue(port, {
        type: "number",
        required: true,
        min: 1,
        max: 65535,
        errorMessage: "Port must be between 1 and 65535",
    }, { fieldName });
}
/**
 * Validate a timeout value
 */
export function validateTimeout(timeout, fieldName = "timeout") {
    return ValidationUtils.validateValue(timeout, {
        type: "number",
        required: true,
        min: 1000,
        max: 300000, // 5 minutes
        errorMessage: "Timeout must be between 1 second and 5 minutes",
    }, { fieldName });
}
/**
 * Validate retry count
 */
export function validateRetryCount(retryCount, fieldName = "retryCount") {
    return ValidationUtils.validateValue(retryCount, {
        type: "number",
        required: true,
        min: 0,
        max: 10,
        errorMessage: "Retry count must be between 0 and 10",
    }, { fieldName });
}
// ============================================================================
// AI/ML Validators
// ============================================================================
/**
 * Validate a model name
 */
export function validateModelName(modelName, fieldName = "modelName") {
    return ValidationUtils.validateValue(modelName, {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9._-]+$/,
        errorMessage: "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens",
    }, { fieldName });
}
/**
 * Validate a prompt
 */
export function validatePrompt(prompt, fieldName = "prompt") {
    return ValidationUtils.validateValue(prompt, {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 10000,
        errorMessage: "Prompt must be 1-10000 characters",
    }, { fieldName });
}
/**
 * Validate temperature parameter
 */
export function validateTemperature(temperature, fieldName = "temperature") {
    return ValidationUtils.validateValue(temperature, {
        type: "number",
        required: true,
        min: 0,
        max: 2,
        errorMessage: "Temperature must be between 0 and 2",
    }, { fieldName });
}
/**
 * Validate max tokens parameter
 */
export function validateMaxTokens(maxTokens, fieldName = "maxTokens") {
    return ValidationUtils.validateValue(maxTokens, {
        type: "number",
        required: true,
        min: 1,
        max: 100000,
        errorMessage: "Max tokens must be between 1 and 100000",
    }, { fieldName });
}
// ============================================================================
// UI/UX Validators
// ============================================================================
/**
 * Validate a theme
 */
export function validateTheme(theme, fieldName = "theme") {
    return ValidationUtils.validateValue(theme, {
        type: "string",
        required: true,
        enum: ["light", "dark", "auto"],
        errorMessage: "Theme must be light, dark, or auto",
    }, { fieldName });
}
/**
 * Validate a language code
 */
export function validateLanguage(language, fieldName = "language") {
    return ValidationUtils.validateValue(language, {
        type: "string",
        required: true,
        minLength: 2,
        maxLength: 5,
        pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
        errorMessage: "Language must be a valid locale code (e.g., 'en' or 'en-US')",
    }, { fieldName });
}
/**
 * Validate a color value
 */
export function validateColor(color, fieldName = "color") {
    return ValidationUtils.validateValue(color, {
        type: "string",
        required: true,
        pattern: /^#[0-9A-Fa-f]{6}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
        errorMessage: "Color must be a valid hex, RGB, or HSL color",
    }, { fieldName });
}
// ============================================================================
// Utility Validators
// ============================================================================
/**
 * Validate that a value is not empty
 */
export function validateNotEmpty(value, fieldName = "field") {
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
export function validatePositive(value, fieldName = "field") {
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
export function validateRange(value, min, max, fieldName = "field") {
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
