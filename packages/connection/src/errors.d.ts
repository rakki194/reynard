/**
 * Consolidated Error Handling for Reynard Framework
 *
 * This module provides unified error handling patterns that eliminate
 * duplication across Reynard packages. It consolidates error types,
 * handling utilities, and retry logic from multiple packages.
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
export declare class ReynardError extends Error {
    readonly code: string;
    readonly context: BaseErrorContext;
    readonly originalError?: Error;
    readonly retryable: boolean;
    constructor(message: string, code: string, context?: BaseErrorContext, originalError?: Error, retryable?: boolean);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        context: BaseErrorContext;
        retryable: boolean;
        stack: string | undefined;
    };
}
export declare class ValidationError extends ReynardError {
    constructor(message: string, context: ValidationErrorContext, originalError?: Error);
}
export declare class NetworkError extends ReynardError {
    constructor(message: string, context: NetworkErrorContext, originalError?: Error, retryable?: boolean);
}
export declare class AuthenticationError extends ReynardError {
    constructor(message: string, context: AuthenticationErrorContext, originalError?: Error);
}
export declare class ProcessingError extends ReynardError {
    constructor(message: string, context: ProcessingErrorContext, originalError?: Error, retryable?: boolean);
}
export declare class TimeoutError extends ReynardError {
    constructor(message: string, context: BaseErrorContext, originalError?: Error);
}
export declare class RateLimitError extends ReynardError {
    constructor(message: string, context: BaseErrorContext, originalError?: Error);
}
export interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryCondition?: (error: Error) => boolean;
}
export interface ErrorHandlerOptions {
    logErrors?: boolean;
    reportErrors?: boolean;
    context?: BaseErrorContext;
}
export declare class ErrorHandler {
    private static instance;
    private errorLog;
    private maxLogSize;
    static getInstance(): ErrorHandler;
    /**
     * Wrap an async function with error handling
     */
    wrapAsync<T>(fn: () => Promise<T>, errorMessage: string, context: BaseErrorContext, options?: ErrorHandlerOptions): Promise<T>;
    /**
     * Retry an operation with exponential backoff
     */
    retry<T>(fn: () => Promise<T>, options?: RetryOptions, context?: BaseErrorContext): Promise<T>;
    /**
     * Create a standardized error with context
     */
    createError(message: string, originalError?: Error, context?: BaseErrorContext): ReynardError;
    /**
     * Handle and log errors
     */
    handleError(error: ReynardError, options?: ErrorHandlerOptions): void;
    /**
     * Log error with context
     */
    private logError;
    /**
     * Report error to external service (placeholder)
     */
    private reportError;
    /**
     * Get error statistics
     */
    getErrorStats(): {
        total: number;
        retryable: number;
        nonRetryable: number;
        byCode: Record<string, number>;
        recentErrors: ReynardError[];
    };
    /**
     * Clear error log
     */
    clearLog(): void;
}
/**
 * Create error handler instance
 */
export declare const errorHandler: ErrorHandler;
/**
 * Wrap async function with error handling
 */
export declare function wrapAsync<T>(fn: () => Promise<T>, errorMessage: string, context?: BaseErrorContext): Promise<T>;
/**
 * Retry operation with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: RetryOptions, context?: BaseErrorContext): Promise<T>;
/**
 * Create standardized error
 */
export declare function createError(message: string, originalError?: Error, context?: BaseErrorContext): ReynardError;
/**
 * Check if error is retryable
 */
export declare function isRetryableError(error: Error): boolean;
/**
 * Extract error message safely
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Extract error code safely
 */
export declare function getErrorCode(error: unknown): string;
