/**
 * Error and Validation Types
 *
 * Defines types for error handling, validation results, and custom
 * error classes within the Reynard framework.
 */
export interface ValidationResult {
    isValid: boolean;
    error?: string;
    warnings?: string[];
}
export interface MultiValidationResult {
    isValid: boolean;
    results: Record<string, ValidationResult>;
    errors: string[];
    warnings: string[];
}
export declare class AIError extends Error {
    code: string;
    context?: Record<string, any> | undefined;
    constructor(message: string, code: string, context?: Record<string, any> | undefined);
}
export declare class ModelError extends AIError {
    modelName: string;
    constructor(message: string, modelName: string, context?: Record<string, any>);
}
export declare class ServiceError extends AIError {
    serviceName: string;
    constructor(message: string, serviceName: string, context?: Record<string, any>);
}
