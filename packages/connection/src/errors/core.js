/**
 * Core Error System
 *
 * Base error classes and types for the Reynard error handling system.
 * Provides consistent error structure and context across all packages.
 */
// ============================================================================
// Base Error Classes
// ============================================================================
/**
 * Base error class for all Reynard errors
 */
export class ReynardError extends Error {
    constructor(message, code, context = {}) {
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
        Object.defineProperty(this, "timestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ReynardError";
        this.code = code;
        this.timestamp = Date.now();
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ReynardError);
        }
    }
    /**
     * Convert error to JSON
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
    /**
     * Convert error to string
     */
    toString() {
        return `${this.name}: ${this.message} (${this.code})`;
    }
}
/**
 * Validation error class
 */
export class ValidationError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "VALIDATION_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ValidationError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Network error class
 */
export class NetworkError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "NETWORK_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "NetworkError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Authentication error class
 */
export class AuthenticationError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "AUTHENTICATION_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "AuthenticationError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Authorization error class
 */
export class AuthorizationError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "AUTHORIZATION_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "AuthorizationError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Processing error class
 */
export class ProcessingError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "PROCESSING_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ProcessingError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Database error class
 */
export class DatabaseError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "DATABASE_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "DatabaseError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Configuration error class
 */
export class ConfigurationError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "CONFIGURATION_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "ConfigurationError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Timeout error class
 */
export class TimeoutError extends ReynardError {
    constructor(message, context = {}) {
        super(message, "TIMEOUT_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "TimeoutError";
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
/**
 * Rate limit error class
 */
export class RateLimitError extends ReynardError {
    constructor(message, retryAfter, context = {}) {
        super(message, "RATE_LIMIT_ERROR", context);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "retryAfter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = "RateLimitError";
        this.retryAfter = retryAfter;
        this.context = {
            timestamp: this.timestamp,
            source: "reynard",
            ...context,
        };
    }
}
// ============================================================================
// Error Factory Functions
// ============================================================================
/**
 * Create a validation error
 */
export function createValidationError(message, field, value, constraint) {
    return new ValidationError(message, {
        field,
        value,
        constraint,
    });
}
/**
 * Create a network error
 */
export function createNetworkError(message, url, method, statusCode) {
    return new NetworkError(message, {
        url,
        method,
        statusCode,
    });
}
/**
 * Create an authentication error
 */
export function createAuthenticationError(message, tokenType, resource) {
    return new AuthenticationError(message, {
        tokenType,
        resource,
    });
}
/**
 * Create an authorization error
 */
export function createAuthorizationError(message, permission, resource) {
    return new AuthorizationError(message, {
        permission,
        resource,
    });
}
/**
 * Create a processing error
 */
export function createProcessingError(message, operation, stage, fileId) {
    return new ProcessingError(message, {
        operation,
        stage,
        fileId,
    });
}
/**
 * Create a database error
 */
export function createDatabaseError(message, table, query, constraint) {
    return new DatabaseError(message, {
        table,
        query,
        constraint,
    });
}
/**
 * Create a configuration error
 */
export function createConfigurationError(message, configKey, configValue, expectedType) {
    return new ConfigurationError(message, {
        configKey,
        configValue,
        expectedType,
    });
}
/**
 * Create a timeout error
 */
export function createTimeoutError(message, operation) {
    return new TimeoutError(message, {
        operation,
    });
}
/**
 * Create a rate limit error
 */
export function createRateLimitError(message, retryAfter) {
    return new RateLimitError(message, retryAfter);
}
// ============================================================================
// Error Type Guards
// ============================================================================
/**
 * Check if error is a Reynard error
 */
export function isReynardError(error) {
    return error instanceof ReynardError;
}
/**
 * Check if error is a validation error
 */
export function isValidationError(error) {
    return error instanceof ValidationError;
}
/**
 * Check if error is a network error
 */
export function isNetworkError(error) {
    return error instanceof NetworkError;
}
/**
 * Check if error is an authentication error
 */
export function isAuthenticationError(error) {
    return error instanceof AuthenticationError;
}
/**
 * Check if error is an authorization error
 */
export function isAuthorizationError(error) {
    return error instanceof AuthorizationError;
}
/**
 * Check if error is a processing error
 */
export function isProcessingError(error) {
    return error instanceof ProcessingError;
}
/**
 * Check if error is a database error
 */
export function isDatabaseError(error) {
    return error instanceof DatabaseError;
}
/**
 * Check if error is a configuration error
 */
export function isConfigurationError(error) {
    return error instanceof ConfigurationError;
}
/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error) {
    return error instanceof TimeoutError;
}
/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error) {
    return error instanceof RateLimitError;
}
// ============================================================================
// Error Utilities
// ============================================================================
/**
 * Get error code from any error
 */
export function getErrorCode(error) {
    if (isReynardError(error)) {
        return error.code;
    }
    if (error instanceof Error) {
        return error.name;
    }
    return "UNKNOWN_ERROR";
}
/**
 * Get error message from any error
 */
export function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "Unknown error";
}
/**
 * Get error context from any error
 */
export function getErrorContext(error) {
    if (isReynardError(error)) {
        return error.context;
    }
    return null;
}
/**
 * Convert any error to a Reynard error
 */
export function toReynardError(error, source = "reynard") {
    if (isReynardError(error)) {
        return error;
    }
    if (error instanceof Error) {
        return new ReynardError(error.message, error.name, { source });
    }
    if (typeof error === "string") {
        return new ReynardError(error, "STRING_ERROR", { source });
    }
    return new ReynardError("Unknown error", "UNKNOWN_ERROR", { source });
}
/**
 * Extract error details for logging
 */
export function extractErrorDetails(error) {
    if (isReynardError(error)) {
        return {
            name: error.name,
            message: error.message,
            code: error.code,
            context: error.context,
            timestamp: error.timestamp,
            stack: error.stack,
        };
    }
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
    return {
        error: String(error),
    };
}
