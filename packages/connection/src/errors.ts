/**
 * Consolidated Error Handling for Reynard Framework
 *
 * This module provides unified error handling patterns that eliminate
 * duplication across Reynard packages. It consolidates error types,
 * handling utilities, and retry logic from multiple packages.
 */

// ============================================================================
// Core Error Types
// ============================================================================

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

// ============================================================================
// Error Classes
// ============================================================================

export class ReynardError extends Error {
  public readonly code: string;
  public readonly context: BaseErrorContext;
  public readonly originalError?: Error;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    context: BaseErrorContext = { timestamp: Date.now(), source: "unknown" },
    originalError?: Error,
    retryable: boolean = false,
  ) {
    super(message);
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
  constructor(
    message: string,
    context: ValidationErrorContext,
    originalError?: Error,
  ) {
    super(message, "VALIDATION_ERROR", context, originalError, false);
    this.name = "ValidationError";
  }
}

export class NetworkError extends ReynardError {
  constructor(
    message: string,
    context: NetworkErrorContext,
    originalError?: Error,
    retryable: boolean = true,
  ) {
    super(message, "NETWORK_ERROR", context, originalError, retryable);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends ReynardError {
  constructor(
    message: string,
    context: AuthenticationErrorContext,
    originalError?: Error,
  ) {
    super(message, "AUTHENTICATION_ERROR", context, originalError, false);
    this.name = "AuthenticationError";
  }
}

export class ProcessingError extends ReynardError {
  constructor(
    message: string,
    context: ProcessingErrorContext,
    originalError?: Error,
    retryable: boolean = true,
  ) {
    super(message, "PROCESSING_ERROR", context, originalError, retryable);
    this.name = "ProcessingError";
  }
}

export class TimeoutError extends ReynardError {
  constructor(
    message: string,
    context: BaseErrorContext,
    originalError?: Error,
  ) {
    super(message, "TIMEOUT_ERROR", context, originalError, true);
    this.name = "TimeoutError";
  }
}

export class RateLimitError extends ReynardError {
  constructor(
    message: string,
    context: BaseErrorContext,
    originalError?: Error,
  ) {
    super(message, "RATE_LIMIT_ERROR", context, originalError, true);
    this.name = "RateLimitError";
  }
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

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

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ReynardError[] = [];
  private maxLogSize = 1000;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Wrap an async function with error handling
   */
  async wrapAsync<T>(
    fn: () => Promise<T>,
    errorMessage: string,
    context: BaseErrorContext,
    options: ErrorHandlerOptions = {},
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const reynardError = this.createError(
        errorMessage,
        error as Error,
        context,
      );
      this.handleError(reynardError, options);
      throw reynardError;
    }
  }

  /**
   * Retry an operation with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    context: BaseErrorContext = { timestamp: Date.now(), source: "retry" },
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      retryCondition = (error) =>
        error instanceof ReynardError && error.retryable,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries || !retryCondition(lastError)) {
          const reynardError = this.createError(
            `Operation failed after ${maxRetries} retries: ${lastError.message}`,
            lastError,
            {
              ...context,
              metadata: { ...context.metadata, retryCount: attempt },
            },
          );
          throw reynardError;
        }

        // Exponential backoff with jitter
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt) +
            Math.random() * 1000,
          maxDelay,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Create a standardized error with context
   */
  createError(
    message: string,
    originalError?: Error,
    context: BaseErrorContext = {
      timestamp: Date.now(),
      source: "error-handler",
    },
  ): ReynardError {
    if (originalError instanceof ReynardError) {
      return originalError;
    }

    // Determine error type based on original error
    if (
      originalError?.name === "ValidationError" ||
      originalError?.message.includes("validation")
    ) {
      return new ValidationError(
        message,
        context as ValidationErrorContext,
        originalError,
      );
    }

    if (
      originalError?.name === "TypeError" &&
      originalError?.message.includes("fetch")
    ) {
      return new NetworkError(
        message,
        context as NetworkErrorContext,
        originalError,
      );
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
  handleError(error: ReynardError, options: ErrorHandlerOptions = {}): void {
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
  private logError(error: ReynardError): void {
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
  private reportError(error: ReynardError): void {
    // TODO: Implement error reporting to external service
    console.warn("Error reporting not implemented:", error.toJSON());
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const errors = this.errorLog;
    const total = errors.length;
    const byCode = errors.reduce(
      (acc, error) => {
        acc[error.code] = (acc[error.code] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

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
  clearLog(): void {
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
export async function wrapAsync<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  context?: BaseErrorContext,
): Promise<T> {
  return errorHandler.wrapAsync(
    fn,
    errorMessage,
    context || { timestamp: Date.now(), source: "wrap-async" },
  );
}

/**
 * Retry operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
  context?: BaseErrorContext,
): Promise<T> {
  return errorHandler.retry(fn, options, context);
}

/**
 * Create standardized error
 */
export function createError(
  message: string,
  originalError?: Error,
  context?: BaseErrorContext,
): ReynardError {
  return errorHandler.createError(message, originalError, context);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
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
export function getErrorMessage(error: unknown): string {
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
export function getErrorCode(error: unknown): string {
  if (error instanceof ReynardError) {
    return error.code;
  }
  if (error instanceof Error) {
    return error.name;
  }
  return "UNKNOWN_ERROR";
}
