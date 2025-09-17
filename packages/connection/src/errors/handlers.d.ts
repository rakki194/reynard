/**
 * Error Handlers
 *
 * Error handling utilities and handlers for common error scenarios
 * across the Reynard framework.
 */
import { ReynardError, ValidationError, NetworkError, AuthenticationError, AuthorizationError, ProcessingError, DatabaseError, ConfigurationError, TimeoutError, RateLimitError } from "./core";
export interface ErrorHandler {
    /**
     * Handle an error
     */
    handle(error: unknown, context?: Record<string, unknown>): Promise<void> | void;
    /**
     * Check if this handler can handle the error
     */
    canHandle(error: unknown): boolean;
    /**
     * Get handler priority (higher numbers are handled first)
     */
    getPriority(): number;
}
export declare class ErrorHandlerSystem {
    private handlers;
    /**
     * Add an error handler
     */
    addHandler(handler: ErrorHandler): void;
    /**
     * Remove an error handler
     */
    removeHandler(handler: ErrorHandler): void;
    /**
     * Clear all handlers
     */
    clearHandlers(): void;
    /**
     * Handle an error using registered handlers
     */
    handleError(error: unknown, context?: Record<string, unknown>): Promise<void>;
}
/**
 * Console logging error handler
 */
export declare class ConsoleErrorHandler implements ErrorHandler {
    private logLevel;
    constructor(logLevel?: "error" | "warn" | "info");
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Validation error handler
 */
export declare class ValidationErrorHandler implements ErrorHandler {
    private onValidationError?;
    constructor(onValidationError?: ((error: ValidationError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Network error handler
 */
export declare class NetworkErrorHandler implements ErrorHandler {
    private onNetworkError?;
    constructor(onNetworkError?: ((error: NetworkError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Authentication error handler
 */
export declare class AuthenticationErrorHandler implements ErrorHandler {
    private onAuthenticationError?;
    constructor(onAuthenticationError?: ((error: AuthenticationError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Authorization error handler
 */
export declare class AuthorizationErrorHandler implements ErrorHandler {
    private onAuthorizationError?;
    constructor(onAuthorizationError?: ((error: AuthorizationError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Processing error handler
 */
export declare class ProcessingErrorHandler implements ErrorHandler {
    private onProcessingError?;
    constructor(onProcessingError?: ((error: ProcessingError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Database error handler
 */
export declare class DatabaseErrorHandler implements ErrorHandler {
    private onDatabaseError?;
    constructor(onDatabaseError?: ((error: DatabaseError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Configuration error handler
 */
export declare class ConfigurationErrorHandler implements ErrorHandler {
    private onConfigurationError?;
    constructor(onConfigurationError?: ((error: ConfigurationError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Timeout error handler
 */
export declare class TimeoutErrorHandler implements ErrorHandler {
    private onTimeoutError?;
    constructor(onTimeoutError?: ((error: TimeoutError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Rate limit error handler
 */
export declare class RateLimitErrorHandler implements ErrorHandler {
    private onRateLimitError?;
    constructor(onRateLimitError?: ((error: RateLimitError) => void) | undefined);
    canHandle(error: unknown): boolean;
    getPriority(): number;
    handle(error: unknown, context?: Record<string, unknown>): void;
}
/**
 * Create a comprehensive error handler system
 */
export declare function createErrorHandlerSystem(options: {
    enableConsoleLogging?: boolean;
    onValidationError?: (error: ValidationError) => void;
    onNetworkError?: (error: NetworkError) => void;
    onAuthenticationError?: (error: AuthenticationError) => void;
    onAuthorizationError?: (error: AuthorizationError) => void;
    onProcessingError?: (error: ProcessingError) => void;
    onDatabaseError?: (error: DatabaseError) => void;
    onConfigurationError?: (error: ConfigurationError) => void;
    onTimeoutError?: (error: TimeoutError) => void;
    onRateLimitError?: (error: RateLimitError) => void;
}): ErrorHandlerSystem;
/**
 * Global error handler system
 */
export declare const globalErrorHandler: ErrorHandlerSystem;
/**
 * Handle an error using the global error handler
 */
export declare function errorHandler(error: unknown, context?: Record<string, unknown>): Promise<void>;
/**
 * Wrap a function with error handling
 */
export declare function wrapAsync<T>(fn: () => Promise<T>, errorMessage: string, context?: Record<string, unknown>): Promise<{
    success: true;
    data: T;
} | {
    success: false;
    error: ReynardError;
}>;
