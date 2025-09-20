/**
 * Error Handlers
 *
 * Error handling utilities and handlers for common error scenarios
 * across the Reynard framework.
 */

import {
  ReynardError,
  ValidationError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ProcessingError,
  DatabaseError,
  ConfigurationError,
  TimeoutError,
  RateLimitError,
  isReynardError,
  isValidationError,
  isNetworkError,
  isAuthenticationError,
  isAuthorizationError,
  isProcessingError,
  isDatabaseError,
  isConfigurationError,
  isTimeoutError,
  isRateLimitError,
  getErrorCode,
  getErrorMessage,
  getErrorContext,
  toReynardError,
  extractErrorDetails,
} from "./core";

// ============================================================================
// Error Handler Interface
// ============================================================================

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

// ============================================================================
// Error Handler System
// ============================================================================

export class ErrorHandlerSystem {
  private handlers: ErrorHandler[] = [];

  /**
   * Add an error handler
   */
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
    // Sort by priority (highest first)
    this.handlers.sort((a, b) => b.getPriority() - a.getPriority());
  }

  /**
   * Remove an error handler
   */
  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers = [];
  }

  /**
   * Handle an error using registered handlers
   */
  async handleError(error: unknown, context?: Record<string, unknown>): Promise<void> {
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        try {
          await handler.handle(error, context);
          return; // First handler that can handle the error wins
        } catch (handlerError) {
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
export class ConsoleErrorHandler implements ErrorHandler {
  constructor(private logLevel: "error" | "warn" | "info" = "error") {}

  canHandle(error: unknown): boolean {
    return true; // Can handle any error
  }

  getPriority(): number {
    return 100; // High priority
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
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
export class ValidationErrorHandler implements ErrorHandler {
  constructor(private onValidationError?: (error: ValidationError) => void) {}

  canHandle(error: unknown): boolean {
    return isValidationError(error);
  }

  getPriority(): number {
    return 200; // Higher priority than console
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isValidationError(error)) {
      if (this.onValidationError) {
        this.onValidationError(error);
      } else {
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
export class NetworkErrorHandler implements ErrorHandler {
  constructor(private onNetworkError?: (error: NetworkError) => void) {}

  canHandle(error: unknown): boolean {
    return isNetworkError(error);
  }

  getPriority(): number {
    return 200;
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isNetworkError(error)) {
      if (this.onNetworkError) {
        this.onNetworkError(error);
      } else {
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
export class AuthenticationErrorHandler implements ErrorHandler {
  constructor(private onAuthenticationError?: (error: AuthenticationError) => void) {}

  canHandle(error: unknown): boolean {
    return isAuthenticationError(error);
  }

  getPriority(): number {
    return 300; // High priority for auth errors
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isAuthenticationError(error)) {
      if (this.onAuthenticationError) {
        this.onAuthenticationError(error);
      } else {
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
export class AuthorizationErrorHandler implements ErrorHandler {
  constructor(private onAuthorizationError?: (error: AuthorizationError) => void) {}

  canHandle(error: unknown): boolean {
    return isAuthorizationError(error);
  }

  getPriority(): number {
    return 300; // High priority for auth errors
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isAuthorizationError(error)) {
      if (this.onAuthorizationError) {
        this.onAuthorizationError(error);
      } else {
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
export class ProcessingErrorHandler implements ErrorHandler {
  constructor(private onProcessingError?: (error: ProcessingError) => void) {}

  canHandle(error: unknown): boolean {
    return isProcessingError(error);
  }

  getPriority(): number {
    return 200;
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isProcessingError(error)) {
      if (this.onProcessingError) {
        this.onProcessingError(error);
      } else {
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
export class DatabaseErrorHandler implements ErrorHandler {
  constructor(private onDatabaseError?: (error: DatabaseError) => void) {}

  canHandle(error: unknown): boolean {
    return isDatabaseError(error);
  }

  getPriority(): number {
    return 250; // High priority for database errors
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isDatabaseError(error)) {
      if (this.onDatabaseError) {
        this.onDatabaseError(error);
      } else {
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
export class ConfigurationErrorHandler implements ErrorHandler {
  constructor(private onConfigurationError?: (error: ConfigurationError) => void) {}

  canHandle(error: unknown): boolean {
    return isConfigurationError(error);
  }

  getPriority(): number {
    return 400; // Very high priority for config errors
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isConfigurationError(error)) {
      if (this.onConfigurationError) {
        this.onConfigurationError(error);
      } else {
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
export class TimeoutErrorHandler implements ErrorHandler {
  constructor(private onTimeoutError?: (error: TimeoutError) => void) {}

  canHandle(error: unknown): boolean {
    return isTimeoutError(error);
  }

  getPriority(): number {
    return 200;
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isTimeoutError(error)) {
      if (this.onTimeoutError) {
        this.onTimeoutError(error);
      } else {
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
export class RateLimitErrorHandler implements ErrorHandler {
  constructor(private onRateLimitError?: (error: RateLimitError) => void) {}

  canHandle(error: unknown): boolean {
    return isRateLimitError(error);
  }

  getPriority(): number {
    return 200;
  }

  handle(error: unknown, context?: Record<string, unknown>): void {
    if (isRateLimitError(error)) {
      if (this.onRateLimitError) {
        this.onRateLimitError(error);
      } else {
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
export function createErrorHandlerSystem(options: {
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
}): ErrorHandlerSystem {
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
export async function errorHandler(error: unknown, context?: Record<string, unknown>): Promise<void> {
  await globalErrorHandler.handleError(error, context);
}

/**
 * Wrap a function with error handling
 */
export function wrapAsync<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  context?: Record<string, unknown>
): Promise<{ success: true; data: T } | { success: false; error: ReynardError }> {
  return fn()
    .then(data => ({ success: true as const, data }))
    .catch(error => {
      const reynardError = toReynardError(error, (context?.source as string) || "reynard");
      errorHandler(reynardError, context);
      return { success: false as const, error: reynardError };
    });
}
