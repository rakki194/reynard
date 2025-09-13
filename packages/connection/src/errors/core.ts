/**
 * Core Error System
 *
 * Base error classes and types for the Reynard error handling system.
 * Provides consistent error structure and context across all packages.
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

// ============================================================================
// Base Error Classes
// ============================================================================

/**
 * Base error class for all Reynard errors
 */
export class ReynardError extends Error {
  public readonly code: string;
  public readonly context: BaseErrorContext;
  public readonly timestamp: number;
  public readonly stack?: string;

  constructor(message: string, code: string, context: Partial<BaseErrorContext> = {}) {
    super(message);
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
  toJSON(): Record<string, unknown> {
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
  toString(): string {
    return `${this.name}: ${this.message} (${this.code})`;
  }
}

/**
 * Validation error class
 */
export class ValidationError extends ReynardError {
  public readonly context: ValidationErrorContext;

  constructor(message: string, context: Partial<ValidationErrorContext> = {}) {
    super(message, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
    this.context = {
      timestamp: this.timestamp,
      source: "reynard",
      ...context,
    } as ValidationErrorContext;
  }
}

/**
 * Network error class
 */
export class NetworkError extends ReynardError {
  public readonly context: NetworkErrorContext;

  constructor(message: string, context: Partial<NetworkErrorContext> = {}) {
    super(message, "NETWORK_ERROR", context);
    this.name = "NetworkError";
    this.context = {
      timestamp: this.timestamp,
      source: "reynard",
      ...context,
    } as NetworkErrorContext;
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends ReynardError {
  public readonly context: AuthenticationErrorContext;

  constructor(message: string, context: Partial<AuthenticationErrorContext> = {}) {
    super(message, "AUTHENTICATION_ERROR", context);
    this.name = "AuthenticationError";
    this.context = {
      timestamp: this.timestamp,
      source: "reynard",
      ...context,
    } as AuthenticationErrorContext;
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends ReynardError {
  public readonly context: AuthenticationErrorContext;

  constructor(message: string, context: Partial<AuthenticationErrorContext> = {}) {
    super(message, "AUTHORIZATION_ERROR", context);
    this.name = "AuthorizationError";
    this.context = {
      timestamp: this.timestamp,
      source: "reynard",
      ...context,
    } as AuthenticationErrorContext;
  }
}

/**
 * Processing error class
 */
export class ProcessingError extends ReynardError {
  public readonly context: ProcessingErrorContext;

  constructor(message: string, context: Partial<ProcessingErrorContext> = {}) {
    super(message, "PROCESSING_ERROR", context);
    this.name = "ProcessingError";
    this.context = {
      timestamp: this.timestamp,
      source: "reynard",
      ...context,
    } as ProcessingErrorContext;
  }
}

/**
 * Database error class
 */
export class DatabaseError extends ReynardError {
  public readonly context: DatabaseErrorContext;

  constructor(message: string, context: Partial<DatabaseErrorContext> = {}) {
    super(message, "DATABASE_ERROR", context);
    this.name = "DatabaseError";
    this.context = {
      timestamp: this.timestamp,
      source: "reynard",
      ...context,
    } as DatabaseErrorContext;
  }
}

/**
 * Configuration error class
 */
export class ConfigurationError extends ReynardError {
  public readonly context: ConfigurationErrorContext;

  constructor(message: string, context: Partial<ConfigurationErrorContext> = {}) {
    super(message, "CONFIGURATION_ERROR", context);
    this.name = "ConfigurationError";
    this.context = {
      timestamp: this.timestamp,
      source: "reynard",
      ...context,
    } as ConfigurationErrorContext;
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends ReynardError {
  public readonly context: BaseErrorContext;

  constructor(message: string, context: Partial<BaseErrorContext> = {}) {
    super(message, "TIMEOUT_ERROR", context);
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
  public readonly context: BaseErrorContext;
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, context: Partial<BaseErrorContext> = {}) {
    super(message, "RATE_LIMIT_ERROR", context);
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
export function createValidationError(
  message: string,
  field?: string,
  value?: unknown,
  constraint?: string,
): ValidationError {
  return new ValidationError(message, {
    field,
    value,
    constraint,
  });
}

/**
 * Create a network error
 */
export function createNetworkError(
  message: string,
  url?: string,
  method?: string,
  statusCode?: number,
): NetworkError {
  return new NetworkError(message, {
    url,
    method,
    statusCode,
  });
}

/**
 * Create an authentication error
 */
export function createAuthenticationError(
  message: string,
  tokenType?: string,
  resource?: string,
): AuthenticationError {
  return new AuthenticationError(message, {
    tokenType,
    resource,
  });
}

/**
 * Create an authorization error
 */
export function createAuthorizationError(
  message: string,
  permission?: string,
  resource?: string,
): AuthorizationError {
  return new AuthorizationError(message, {
    permission,
    resource,
  });
}

/**
 * Create a processing error
 */
export function createProcessingError(
  message: string,
  operation?: string,
  stage?: string,
  fileId?: string,
): ProcessingError {
  return new ProcessingError(message, {
    operation,
    stage,
    fileId,
  });
}

/**
 * Create a database error
 */
export function createDatabaseError(
  message: string,
  table?: string,
  query?: string,
  constraint?: string,
): DatabaseError {
  return new DatabaseError(message, {
    table,
    query,
    constraint,
  });
}

/**
 * Create a configuration error
 */
export function createConfigurationError(
  message: string,
  configKey?: string,
  configValue?: unknown,
  expectedType?: string,
): ConfigurationError {
  return new ConfigurationError(message, {
    configKey,
    configValue,
    expectedType,
  });
}

/**
 * Create a timeout error
 */
export function createTimeoutError(
  message: string,
  operation?: string,
): TimeoutError {
  return new TimeoutError(message, {
    operation,
  });
}

/**
 * Create a rate limit error
 */
export function createRateLimitError(
  message: string,
  retryAfter?: number,
): RateLimitError {
  return new RateLimitError(message, retryAfter);
}

// ============================================================================
// Error Type Guards
// ============================================================================

/**
 * Check if error is a Reynard error
 */
export function isReynardError(error: unknown): error is ReynardError {
  return error instanceof ReynardError;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Check if error is an authentication error
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Check if error is an authorization error
 */
export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Check if error is a processing error
 */
export function isProcessingError(error: unknown): error is ProcessingError {
  return error instanceof ProcessingError;
}

/**
 * Check if error is a database error
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Check if error is a configuration error
 */
export function isConfigurationError(error: unknown): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Get error code from any error
 */
export function getErrorCode(error: unknown): string {
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
export function getErrorMessage(error: unknown): string {
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
export function getErrorContext(error: unknown): BaseErrorContext | null {
  if (isReynardError(error)) {
    return error.context;
  }
  
  return null;
}

/**
 * Convert any error to a Reynard error
 */
export function toReynardError(error: unknown, source = "reynard"): ReynardError {
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
export function extractErrorDetails(error: unknown): Record<string, unknown> {
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
