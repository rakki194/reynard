/**
 * Convenience validation functions for common use cases
 */
import type { PasswordStrength, ValidationResult, ValidationRules } from "./types.js";
/**
 * Validate an email address
 */
export declare function validateEmail(email: string, fieldName?: string): ValidationResult;
/**
 * Validate a password
 */
export declare function validatePassword(password: string, fieldName?: string): ValidationResult;
/**
 * Validate a username
 */
export declare function validateUsername(username: string, fieldName?: string): ValidationResult;
/**
 * Validate a URL
 */
export declare function validateUrl(url: string, fieldName?: string): ValidationResult;
/**
 * Validate any value against a schema
 */
export declare function validateValue(value: unknown, schema: {
    type: "string" | "number" | "boolean" | "object" | "array" | "email" | "url" | "date" | "phone" | "ip" | "hex-color" | "username" | "password" | "api-key" | "token" | "filename" | "mime-type" | "port" | "timeout" | "model-name" | "prompt" | "temperature" | "max-tokens" | "theme" | "language" | "color";
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: unknown[];
    errorMessage?: string;
}, fieldName?: string): ValidationResult;
/**
 * Validate an API key
 */
export declare function validateApiKey(apiKey: string, fieldName?: string): ValidationResult;
/**
 * Validate an authentication token
 */
export declare function validateToken(token: string, fieldName?: string): ValidationResult;
/**
 * Validate a filename
 */
export declare function validateFileName(fileName: string, fieldName?: string): ValidationResult;
/**
 * Validate a MIME type
 */
export declare function validateMimeType(mimeType: string, fieldName?: string): ValidationResult;
/**
 * Validate file size
 */
export declare function validateFileSize(fileSize: number, fieldName?: string, maxSize?: number): ValidationResult;
/**
 * Validate a port number
 */
export declare function validatePort(port: number, fieldName?: string): ValidationResult;
/**
 * Validate a timeout value
 */
export declare function validateTimeout(timeout: number, fieldName?: string): ValidationResult;
/**
 * Validate retry count
 */
export declare function validateRetryCount(retryCount: number, fieldName?: string): ValidationResult;
/**
 * Validate a model name
 */
export declare function validateModelName(modelName: string, fieldName?: string): ValidationResult;
/**
 * Validate a prompt
 */
export declare function validatePrompt(prompt: string, fieldName?: string): ValidationResult;
/**
 * Validate temperature parameter
 */
export declare function validateTemperature(temperature: number, fieldName?: string): ValidationResult;
/**
 * Validate max tokens parameter
 */
export declare function validateMaxTokens(maxTokens: number, fieldName?: string): ValidationResult;
/**
 * Validate a theme
 */
export declare function validateTheme(theme: string, fieldName?: string): ValidationResult;
/**
 * Validate a language code
 */
export declare function validateLanguage(language: string, fieldName?: string): ValidationResult;
/**
 * Validate a color value
 */
export declare function validateColor(color: string, fieldName?: string): ValidationResult;
/**
 * Validate that a value is not empty
 */
export declare function validateNotEmpty(value: unknown, fieldName?: string): ValidationResult;
/**
 * Validate that a value is a positive number
 */
export declare function validatePositive(value: number, fieldName?: string): ValidationResult;
/**
 * Validate that a value is within a range
 */
export declare function validateRange(value: number, min: number, max: number, fieldName?: string): ValidationResult;
/**
 * Validate password strength with enhanced feedback
 */
export declare function validatePasswordStrength(password: string, rules?: ValidationRules): PasswordStrength;
/**
 * Validate URL for security
 */
export declare function validateUrlSecurity(url: string): {
    isValid: boolean;
    sanitized?: string;
};
