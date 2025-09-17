/**
 * Core Error System
 *
 * Base error classes and types for the Reynard error handling system.
 * Provides consistent error structure and context across all packages.
 */
export interface BaseErrorContext {
    timestamp: number;
    source: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
}
export interface ValidationErrorContext extends BaseErrorContext {
    field?: string;
    value?: unknown;
    schema?: unknown;
    constraint?: string;
}
export interface NetworkErrorContext extends BaseErrorContext {
    url?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    retryCount?: number;
}
export interface AuthenticationErrorContext extends BaseErrorContext {
    tokenType?: string;
    permission?: string;
    resource?: string;
}
export interface ProcessingErrorContext extends BaseErrorContext {
    fileId?: string;
    fileType?: string;
    operation?: string;
    stage?: string;
}
export interface DatabaseErrorContext extends BaseErrorContext {
    table?: string;
    query?: string;
    constraint?: string;
}
export interface ConfigurationErrorContext extends BaseErrorContext {
    configKey?: string;
    configValue?: unknown;
    expectedType?: string;
}
/**
 * Base error class for all Reynard errors
 */
export declare class ReynardError extends Error {
    readonly code: string;
    readonly context: BaseErrorContext;
    readonly timestamp: number;
    readonly stack?: string;
    constructor(message: string, code: string, context?: Partial<BaseErrorContext>);
    /**
     * Convert error to JSON
     */
    toJSON(): Record<string, unknown>;
    /**
     * Convert error to string
     */
    toString(): string;
}
/**
 * Validation error class
 */
export declare class ValidationError extends ReynardError {
    readonly context: ValidationErrorContext;
    constructor(message: string, context?: Partial<ValidationErrorContext>);
}
/**
 * Network error class
 */
export declare class NetworkError extends ReynardError {
    readonly context: NetworkErrorContext;
    constructor(message: string, context?: Partial<NetworkErrorContext>);
}
/**
 * Authentication error class
 */
export declare class AuthenticationError extends ReynardError {
    readonly context: AuthenticationErrorContext;
    constructor(message: string, context?: Partial<AuthenticationErrorContext>);
}
/**
 * Authorization error class
 */
export declare class AuthorizationError extends ReynardError {
    readonly context: AuthenticationErrorContext;
    constructor(message: string, context?: Partial<AuthenticationErrorContext>);
}
/**
 * Processing error class
 */
export declare class ProcessingError extends ReynardError {
    readonly context: ProcessingErrorContext;
    constructor(message: string, context?: Partial<ProcessingErrorContext>);
}
/**
 * Database error class
 */
export declare class DatabaseError extends ReynardError {
    readonly context: DatabaseErrorContext;
    constructor(message: string, context?: Partial<DatabaseErrorContext>);
}
/**
 * Configuration error class
 */
export declare class ConfigurationError extends ReynardError {
    readonly context: ConfigurationErrorContext;
    constructor(message: string, context?: Partial<ConfigurationErrorContext>);
}
/**
 * Timeout error class
 */
export declare class TimeoutError extends ReynardError {
    readonly context: BaseErrorContext;
    constructor(message: string, context?: Partial<BaseErrorContext>);
}
/**
 * Rate limit error class
 */
export declare class RateLimitError extends ReynardError {
    readonly context: BaseErrorContext;
    readonly retryAfter?: number;
    constructor(message: string, retryAfter?: number, context?: Partial<BaseErrorContext>);
}
/**
 * Create a validation error
 */
export declare function createValidationError(message: string, field?: string, value?: unknown, constraint?: string): ValidationError;
/**
 * Create a network error
 */
export declare function createNetworkError(message: string, url?: string, method?: string, statusCode?: number): NetworkError;
/**
 * Create an authentication error
 */
export declare function createAuthenticationError(message: string, tokenType?: string, resource?: string): AuthenticationError;
/**
 * Create an authorization error
 */
export declare function createAuthorizationError(message: string, permission?: string, resource?: string): AuthorizationError;
/**
 * Create a processing error
 */
export declare function createProcessingError(message: string, operation?: string, stage?: string, fileId?: string): ProcessingError;
/**
 * Create a database error
 */
export declare function createDatabaseError(message: string, table?: string, query?: string, constraint?: string): DatabaseError;
/**
 * Create a configuration error
 */
export declare function createConfigurationError(message: string, configKey?: string, configValue?: unknown, expectedType?: string): ConfigurationError;
/**
 * Create a timeout error
 */
export declare function createTimeoutError(message: string, operation?: string): TimeoutError;
/**
 * Create a rate limit error
 */
export declare function createRateLimitError(message: string, retryAfter?: number): RateLimitError;
/**
 * Check if error is a Reynard error
 */
export declare function isReynardError(error: unknown): error is ReynardError;
/**
 * Check if error is a validation error
 */
export declare function isValidationError(error: unknown): error is ValidationError;
/**
 * Check if error is a network error
 */
export declare function isNetworkError(error: unknown): error is NetworkError;
/**
 * Check if error is an authentication error
 */
export declare function isAuthenticationError(error: unknown): error is AuthenticationError;
/**
 * Check if error is an authorization error
 */
export declare function isAuthorizationError(error: unknown): error is AuthorizationError;
/**
 * Check if error is a processing error
 */
export declare function isProcessingError(error: unknown): error is ProcessingError;
/**
 * Check if error is a database error
 */
export declare function isDatabaseError(error: unknown): error is DatabaseError;
/**
 * Check if error is a configuration error
 */
export declare function isConfigurationError(error: unknown): error is ConfigurationError;
/**
 * Check if error is a timeout error
 */
export declare function isTimeoutError(error: unknown): error is TimeoutError;
/**
 * Check if error is a rate limit error
 */
export declare function isRateLimitError(error: unknown): error is RateLimitError;
/**
 * Get error code from any error
 */
export declare function getErrorCode(error: unknown): string;
/**
 * Get error message from any error
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Get error context from any error
 */
export declare function getErrorContext(error: unknown): BaseErrorContext | null;
/**
 * Convert any error to a Reynard error
 */
export declare function toReynardError(error: unknown, source?: string): ReynardError;
/**
 * Extract error details for logging
 */
export declare function extractErrorDetails(error: unknown): Record<string, unknown>;
