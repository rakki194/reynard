/**
 * Error Handlers
 *
 * Error handling utilities and handlers for common error scenarios
 * across the Reynard framework.
 */
import { isValidationError, isNetworkError, isAuthenticationError, isAuthorizationError, isProcessingError, isDatabaseError, isConfigurationError, isTimeoutError, isRateLimitError, toReynardError, extractErrorDetails, } from "./core";
// ============================================================================
// Error Handler System
// ============================================================================
export class ErrorHandlerSystem {
    constructor() {
        Object.defineProperty(this, "handlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    /**
     * Add an error handler
     */
    addHandler(handler) {
        this.handlers.push(handler);
        // Sort by priority (highest first)
        this.handlers.sort((a, b) => b.getPriority() - a.getPriority());
    }
    /**
     * Remove an error handler
     */
    removeHandler(handler) {
        const index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.handlers.splice(index, 1);
        }
    }
    /**
     * Clear all handlers
     */
    clearHandlers() {
        this.handlers = [];
    }
    /**
     * Handle an error using registered handlers
     */
    async handleError(error, context) {
        for (const handler of this.handlers) {
            if (handler.canHandle(error)) {
                try {
                    await handler.handle(error, context);
                    return; // First handler that can handle the error wins
                }
                catch (handlerError) {
                    console.error("Error handler failed:", handlerError);
                    // Continue to next handler
                }
            }
        }
        // If no handler could handle the error, log it
        console.error("Unhandled error:", extractErrorDetails(error));
    }
}
// ============================================================================
// Built-in Error Handlers
// ============================================================================
/**
 * Console logging error handler
 */
export class ConsoleErrorHandler {
    constructor(logLevel = "error") {
        Object.defineProperty(this, "logLevel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: logLevel
        });
    }
    canHandle(error) {
        return true; // Can handle any error
    }
    getPriority() {
        return 100; // High priority
    }
    handle(error, context) {
        const details = extractErrorDetails(error);
        const message = `[${this.logLevel.toUpperCase()}] ${details.name}: ${details.message}`;
        switch (this.logLevel) {
            case "error":
                console.error(message, { error: details, context });
                break;
            case "warn":
                console.warn(message, { error: details, context });
                break;
            case "info":
                console.info(message, { error: details, context });
                break;
        }
    }
}
/**
 * Validation error handler
 */
export class ValidationErrorHandler {
    constructor(onValidationError) {
        Object.defineProperty(this, "onValidationError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onValidationError
        });
    }
    canHandle(error) {
        return isValidationError(error);
    }
    getPriority() {
        return 200; // Higher priority than console
    }
    handle(error, context) {
        if (isValidationError(error)) {
            if (this.onValidationError) {
                this.onValidationError(error);
            }
            else {
                console.warn("Validation error:", error.message, {
                    field: error.context.field,
                    value: error.context.value,
                    constraint: error.context.constraint,
                    context,
                });
            }
        }
    }
}
/**
 * Network error handler
 */
export class NetworkErrorHandler {
    constructor(onNetworkError) {
        Object.defineProperty(this, "onNetworkError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onNetworkError
        });
    }
    canHandle(error) {
        return isNetworkError(error);
    }
    getPriority() {
        return 200;
    }
    handle(error, context) {
        if (isNetworkError(error)) {
            if (this.onNetworkError) {
                this.onNetworkError(error);
            }
            else {
                console.error("Network error:", error.message, {
                    url: error.context.url,
                    method: error.context.method,
                    statusCode: error.context.statusCode,
                    context,
                });
            }
        }
    }
}
/**
 * Authentication error handler
 */
export class AuthenticationErrorHandler {
    constructor(onAuthenticationError) {
        Object.defineProperty(this, "onAuthenticationError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onAuthenticationError
        });
    }
    canHandle(error) {
        return isAuthenticationError(error);
    }
    getPriority() {
        return 300; // High priority for auth errors
    }
    handle(error, context) {
        if (isAuthenticationError(error)) {
            if (this.onAuthenticationError) {
                this.onAuthenticationError(error);
            }
            else {
                console.error("Authentication error:", error.message, {
                    tokenType: error.context.tokenType,
                    resource: error.context.resource,
                    context,
                });
            }
        }
    }
}
/**
 * Authorization error handler
 */
export class AuthorizationErrorHandler {
    constructor(onAuthorizationError) {
        Object.defineProperty(this, "onAuthorizationError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onAuthorizationError
        });
    }
    canHandle(error) {
        return isAuthorizationError(error);
    }
    getPriority() {
        return 300; // High priority for auth errors
    }
    handle(error, context) {
        if (isAuthorizationError(error)) {
            if (this.onAuthorizationError) {
                this.onAuthorizationError(error);
            }
            else {
                console.error("Authorization error:", error.message, {
                    permission: error.context.permission,
                    resource: error.context.resource,
                    context,
                });
            }
        }
    }
}
/**
 * Processing error handler
 */
export class ProcessingErrorHandler {
    constructor(onProcessingError) {
        Object.defineProperty(this, "onProcessingError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onProcessingError
        });
    }
    canHandle(error) {
        return isProcessingError(error);
    }
    getPriority() {
        return 200;
    }
    handle(error, context) {
        if (isProcessingError(error)) {
            if (this.onProcessingError) {
                this.onProcessingError(error);
            }
            else {
                console.error("Processing error:", error.message, {
                    operation: error.context.operation,
                    stage: error.context.stage,
                    fileId: error.context.fileId,
                    context,
                });
            }
        }
    }
}
/**
 * Database error handler
 */
export class DatabaseErrorHandler {
    constructor(onDatabaseError) {
        Object.defineProperty(this, "onDatabaseError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onDatabaseError
        });
    }
    canHandle(error) {
        return isDatabaseError(error);
    }
    getPriority() {
        return 250; // High priority for database errors
    }
    handle(error, context) {
        if (isDatabaseError(error)) {
            if (this.onDatabaseError) {
                this.onDatabaseError(error);
            }
            else {
                console.error("Database error:", error.message, {
                    table: error.context.table,
                    query: error.context.query,
                    constraint: error.context.constraint,
                    context,
                });
            }
        }
    }
}
/**
 * Configuration error handler
 */
export class ConfigurationErrorHandler {
    constructor(onConfigurationError) {
        Object.defineProperty(this, "onConfigurationError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onConfigurationError
        });
    }
    canHandle(error) {
        return isConfigurationError(error);
    }
    getPriority() {
        return 400; // Very high priority for config errors
    }
    handle(error, context) {
        if (isConfigurationError(error)) {
            if (this.onConfigurationError) {
                this.onConfigurationError(error);
            }
            else {
                console.error("Configuration error:", error.message, {
                    configKey: error.context.configKey,
                    configValue: error.context.configValue,
                    expectedType: error.context.expectedType,
                    context,
                });
            }
        }
    }
}
/**
 * Timeout error handler
 */
export class TimeoutErrorHandler {
    constructor(onTimeoutError) {
        Object.defineProperty(this, "onTimeoutError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onTimeoutError
        });
    }
    canHandle(error) {
        return isTimeoutError(error);
    }
    getPriority() {
        return 200;
    }
    handle(error, context) {
        if (isTimeoutError(error)) {
            if (this.onTimeoutError) {
                this.onTimeoutError(error);
            }
            else {
                console.warn("Timeout error:", error.message, {
                    operation: error.context.operation,
                    context,
                });
            }
        }
    }
}
/**
 * Rate limit error handler
 */
export class RateLimitErrorHandler {
    constructor(onRateLimitError) {
        Object.defineProperty(this, "onRateLimitError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onRateLimitError
        });
    }
    canHandle(error) {
        return isRateLimitError(error);
    }
    getPriority() {
        return 200;
    }
    handle(error, context) {
        if (isRateLimitError(error)) {
            if (this.onRateLimitError) {
                this.onRateLimitError(error);
            }
            else {
                console.warn("Rate limit error:", error.message, {
                    retryAfter: error.retryAfter,
                    context,
                });
            }
        }
    }
}
// ============================================================================
// Error Handler Factory
// ============================================================================
/**
 * Create a comprehensive error handler system
 */
export function createErrorHandlerSystem(options) {
    const system = new ErrorHandlerSystem();
    // Add console logging handler
    if (options.enableConsoleLogging !== false) {
        system.addHandler(new ConsoleErrorHandler());
    }
    // Add specific error handlers
    if (options.onValidationError) {
        system.addHandler(new ValidationErrorHandler(options.onValidationError));
    }
    if (options.onNetworkError) {
        system.addHandler(new NetworkErrorHandler(options.onNetworkError));
    }
    if (options.onAuthenticationError) {
        system.addHandler(new AuthenticationErrorHandler(options.onAuthenticationError));
    }
    if (options.onAuthorizationError) {
        system.addHandler(new AuthorizationErrorHandler(options.onAuthorizationError));
    }
    if (options.onProcessingError) {
        system.addHandler(new ProcessingErrorHandler(options.onProcessingError));
    }
    if (options.onDatabaseError) {
        system.addHandler(new DatabaseErrorHandler(options.onDatabaseError));
    }
    if (options.onConfigurationError) {
        system.addHandler(new ConfigurationErrorHandler(options.onConfigurationError));
    }
    if (options.onTimeoutError) {
        system.addHandler(new TimeoutErrorHandler(options.onTimeoutError));
    }
    if (options.onRateLimitError) {
        system.addHandler(new RateLimitErrorHandler(options.onRateLimitError));
    }
    return system;
}
// ============================================================================
// Global Error Handler
// ============================================================================
/**
 * Global error handler system
 */
export const globalErrorHandler = createErrorHandlerSystem({
    enableConsoleLogging: true,
});
/**
 * Handle an error using the global error handler
 */
export async function errorHandler(error, context) {
    await globalErrorHandler.handleError(error, context);
}
/**
 * Wrap a function with error handling
 */
export function wrapAsync(fn, errorMessage, context) {
    return fn()
        .then((data) => ({ success: true, data }))
        .catch((error) => {
        const reynardError = toReynardError(error, context?.source || "reynard");
        errorHandler(reynardError, context);
        return { success: false, error: reynardError };
    });
}
