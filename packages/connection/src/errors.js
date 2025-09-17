/**
 * Consolidated Error Handling for Reynard Framework
 *
 * This module provides unified error handling patterns that eliminate
 * duplication across Reynard packages. It consolidates error types,
 * handling utilities, and retry logic from multiple packages.
 */
// ============================================================================
// Error Classes
// ============================================================================
export class ReynardError extends Error {
    constructor(message, code, context = { timestamp: Date.now(), source: "unknown" }, originalError, retryable = false) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originalError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "retryable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ReynardError";
        this.code = code;
        this.context = context;
        this.originalError = originalError;
        this.retryable = retryable;
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ReynardError);
        }
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            retryable: this.retryable,
            stack: this.stack,
        };
    }
}
export class ValidationError extends ReynardError {
    constructor(message, context, originalError) {
        super(message, "VALIDATION_ERROR", context, originalError, false);
        this.name = "ValidationError";
    }
}
export class NetworkError extends ReynardError {
    constructor(message, context, originalError, retryable = true) {
        super(message, "NETWORK_ERROR", context, originalError, retryable);
        this.name = "NetworkError";
    }
}
export class AuthenticationError extends ReynardError {
    constructor(message, context, originalError) {
        super(message, "AUTHENTICATION_ERROR", context, originalError, false);
        this.name = "AuthenticationError";
    }
}
export class ProcessingError extends ReynardError {
    constructor(message, context, originalError, retryable = true) {
        super(message, "PROCESSING_ERROR", context, originalError, retryable);
        this.name = "ProcessingError";
    }
}
export class TimeoutError extends ReynardError {
    constructor(message, context, originalError) {
        super(message, "TIMEOUT_ERROR", context, originalError, true);
        this.name = "TimeoutError";
    }
}
export class RateLimitError extends ReynardError {
    constructor(message, context, originalError) {
        super(message, "RATE_LIMIT_ERROR", context, originalError, true);
        this.name = "RateLimitError";
    }
}
export class ErrorHandler {
    constructor() {
        Object.defineProperty(this, "errorLog", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxLogSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        });
    }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    /**
     * Wrap an async function with error handling
     */
    async wrapAsync(fn, errorMessage, context, options = {}) {
        try {
            return await fn();
        }
        catch (error) {
            const reynardError = this.createError(errorMessage, error, context);
            this.handleError(reynardError, options);
            throw reynardError;
        }
    }
    /**
     * Retry an operation with exponential backoff
     */
    async retry(fn, options = {}, context = { timestamp: Date.now(), source: "retry" }) {
        const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, backoffMultiplier = 2, retryCondition = (error) => error instanceof ReynardError && error.retryable, } = options;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxRetries || !retryCondition(lastError)) {
                    const reynardError = this.createError(`Operation failed after ${maxRetries} retries: ${lastError.message}`, lastError, {
                        ...context,
                        metadata: { ...context.metadata, retryCount: attempt },
                    });
                    throw reynardError;
                }
                // Exponential backoff with jitter
                const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt) +
                    Math.random() * 1000, maxDelay);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    /**
     * Create a standardized error with context
     */
    createError(message, originalError, context = {
        timestamp: Date.now(),
        source: "error-handler",
    }) {
        if (originalError instanceof ReynardError) {
            return originalError;
        }
        // Determine error type based on original error
        if (originalError?.name === "ValidationError" ||
            originalError?.message.includes("validation")) {
            return new ValidationError(message, context, originalError);
        }
        if (originalError?.name === "TypeError" &&
            originalError?.message.includes("fetch")) {
            return new NetworkError(message, context, originalError);
        }
        if (originalError?.name === "AbortError") {
            return new TimeoutError(message, context, originalError);
        }
        // Default to base ReynardError
        return new ReynardError(message, "UNKNOWN_ERROR", context, originalError);
    }
    /**
     * Handle and log errors
     */
    handleError(error, options = {}) {
        const { logErrors = true, reportErrors = false } = options;
        if (logErrors) {
            this.logError(error);
        }
        if (reportErrors) {
            this.reportError(error);
        }
    }
    /**
     * Log error with context
     */
    logError(error) {
        this.errorLog.push(error);
        // Maintain log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
        // Console logging with structured format
        console.error("Reynard Error:", {
            name: error.name,
            message: error.message,
            code: error.code,
            context: error.context,
            retryable: error.retryable,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Report error to external service (placeholder)
     */
    reportError(error) {
        // TODO: Implement error reporting to external service
        console.warn("Error reporting not implemented:", error.toJSON());
    }
    /**
     * Get error statistics
     */
    getErrorStats() {
        const errors = this.errorLog;
        const total = errors.length;
        const byCode = errors.reduce((acc, error) => {
            acc[error.code] = (acc[error.code] || 0) + 1;
            return acc;
        }, {});
        const retryable = errors.filter((e) => e.retryable).length;
        const nonRetryable = total - retryable;
        return {
            total,
            retryable,
            nonRetryable,
            byCode,
            recentErrors: errors.slice(-10),
        };
    }
    /**
     * Clear error log
     */
    clearLog() {
        this.errorLog = [];
    }
}
// ============================================================================
// Convenience Functions
// ============================================================================
/**
 * Create error handler instance
 */
export const errorHandler = ErrorHandler.getInstance();
/**
 * Wrap async function with error handling
 */
export async function wrapAsync(fn, errorMessage, context) {
    return errorHandler.wrapAsync(fn, errorMessage, context || { timestamp: Date.now(), source: "wrap-async" });
}
/**
 * Retry operation with exponential backoff
 */
export async function retry(fn, options, context) {
    return errorHandler.retry(fn, options, context);
}
/**
 * Create standardized error
 */
export function createError(message, originalError, context) {
    return errorHandler.createError(message, originalError, context);
}
/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    if (error instanceof ReynardError) {
        return error.retryable;
    }
    // Check for common retryable error patterns
    const retryablePatterns = [
        /network/i,
        /timeout/i,
        /connection/i,
        /temporary/i,
        /rate.?limit/i,
    ];
    return retryablePatterns.some((pattern) => pattern.test(error.message));
}
/**
 * Extract error message safely
 */
export function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "Unknown error occurred";
}
/**
 * Extract error code safely
 */
export function getErrorCode(error) {
    if (error instanceof ReynardError) {
        return error.code;
    }
    if (error instanceof Error) {
        return error.name;
    }
    return "UNKNOWN_ERROR";
}
