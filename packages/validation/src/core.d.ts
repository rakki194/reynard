/**
 * Core validation utilities and engine
 */
import { type FieldValidationOptions, type MultiValidationResult, type ValidationResult, type ValidationSchema } from "./types.js";
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
    private static validateEmail;
    private static validateUrl;
    private static validateDate;
    private static validatePhone;
    private static validateIP;
    private static validateHexColor;
    private static validateUsername;
    private static validatePassword;
    private static validateApiKey;
    private static validateToken;
    private static validateFilename;
    private static validateMimeType;
    private static validatePort;
    private static validateTimeout;
    private static validateModelName;
    private static validatePrompt;
    private static validateTemperature;
    private static validateMaxTokens;
    private static validateTheme;
    private static validateLanguage;
    private static validateColor;
}
