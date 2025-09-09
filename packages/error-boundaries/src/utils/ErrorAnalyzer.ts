/**
 * Error Analysis Utilities
 * Comprehensive error analysis and classification system
 */

import {
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
} from "../types/ErrorTypes";

/**
 * Analyze an error and determine its severity and category
 */
export function analyzeError(
  error: Error,
  errorInfo: any,
): {
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  metadata: Record<string, unknown>;
} {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  const stack = error.stack || "";

  // Determine category based on error characteristics
  const category = determineErrorCategory(error, message, name, stack);

  // Determine severity based on category and context
  const severity = determineErrorSeverity(category, error, errorInfo);

  // Determine if error is recoverable
  const recoverable = isErrorRecoverable(category, severity, error);

  // Extract metadata
  const metadata = extractErrorMetadata(error, errorInfo, stack);

  return {
    severity,
    category,
    recoverable,
    metadata,
  };
}

/**
 * Determine error category based on error characteristics
 */
function determineErrorCategory(
  _error: Error,
  message: string,
  name: string,
  stack: string,
): ErrorCategory {
  // Network errors
  if (
    name.includes("network") ||
    name.includes("fetch") ||
    name.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("cors")
  ) {
    return ErrorCategory.NETWORK;
  }

  // Authentication errors
  if (
    name.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("401") ||
    message.includes("403") ||
    message.includes("token")
  ) {
    return ErrorCategory.AUTHENTICATION;
  }

  // Permission errors
  if (
    message.includes("permission") ||
    message.includes("access denied") ||
    message.includes("not allowed")
  ) {
    return ErrorCategory.PERMISSION;
  }

  // Validation errors
  if (
    name.includes("validation") ||
    name.includes("invalid") ||
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("format")
  ) {
    return ErrorCategory.VALIDATION;
  }

  // Resource errors
  if (
    name.includes("resource") ||
    message.includes("not found") ||
    message.includes("404") ||
    message.includes("file not found") ||
    message.includes("module not found")
  ) {
    return ErrorCategory.RESOURCE;
  }

  // Rendering errors
  if (
    name.includes("render") ||
    name.includes("component") ||
    stack.includes("render") ||
    stack.includes("component")
  ) {
    return ErrorCategory.RENDERING;
  }

  // Timeout errors
  if (
    name.includes("timeout") ||
    message.includes("timeout") ||
    message.includes("timed out")
  ) {
    return ErrorCategory.TIMEOUT;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Determine error severity based on category and context
 */
function determineErrorSeverity(
  category: ErrorCategory,
  error: Error,
  _errorInfo: any,
): ErrorSeverity {
  // Critical errors that break the entire application
  if (
    category === ErrorCategory.AUTHENTICATION ||
    category === ErrorCategory.PERMISSION ||
    error.message.includes("critical") ||
    error.message.includes("fatal")
  ) {
    return ErrorSeverity.CRITICAL;
  }

  // High severity errors that significantly impact functionality
  if (
    category === ErrorCategory.RENDERING ||
    category === ErrorCategory.RESOURCE ||
    error.message.includes("cannot") ||
    error.message.includes("failed to")
  ) {
    return ErrorSeverity.HIGH;
  }

  // Medium severity errors that impact some functionality
  if (
    category === ErrorCategory.NETWORK ||
    category === ErrorCategory.TIMEOUT ||
    category === ErrorCategory.VALIDATION
  ) {
    return ErrorSeverity.MEDIUM;
  }

  // Low severity errors that have minimal impact
  return ErrorSeverity.LOW;
}

/**
 * Determine if an error is recoverable
 */
function isErrorRecoverable(
  category: ErrorCategory,
  severity: ErrorSeverity,
  _error: Error,
): boolean {
  // Critical errors are generally not recoverable
  if (severity === ErrorSeverity.CRITICAL) {
    return false;
  }

  // Network and timeout errors are usually recoverable
  if (
    category === ErrorCategory.NETWORK ||
    category === ErrorCategory.TIMEOUT
  ) {
    return true;
  }

  // Validation errors are usually recoverable
  if (category === ErrorCategory.VALIDATION) {
    return true;
  }

  // Resource errors might be recoverable
  if (category === ErrorCategory.RESOURCE) {
    return true;
  }

  // Rendering errors might be recoverable with fallback UI
  if (category === ErrorCategory.RENDERING) {
    return true;
  }

  return false;
}

/**
 * Extract metadata from error and error info
 */
function extractErrorMetadata(
  _error: Error,
  errorInfo: any,
  stack: string,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  // Extract component information from stack
  const componentMatch = stack.match(/at\s+(\w+)/g);
  if (componentMatch) {
    metadata.components = componentMatch.map((match) =>
      match.replace("at ", ""),
    );
  }

  // Extract file information
  const fileMatch = stack.match(/\(([^)]+\.(tsx?|jsx?)):/g);
  if (fileMatch) {
    metadata.files = fileMatch.map((match) => match.replace(/[()]/g, ""));
  }

  // Extract line numbers
  const lineMatch = stack.match(/:(\d+):(\d+)/g);
  if (lineMatch) {
    metadata.locations = lineMatch.map((match) => match.replace(/:/g, ""));
  }

  // Add error info metadata
  if (errorInfo) {
    if (errorInfo.componentStack) {
      metadata.componentStack = errorInfo.componentStack;
    }
    if (errorInfo.errorBoundary) {
      metadata.errorBoundary = errorInfo.errorBoundary;
    }
  }

  // Add browser information
  if (typeof window !== "undefined") {
    metadata.userAgent = navigator.userAgent;
    metadata.url = window.location.href;
    metadata.timestamp = Date.now();
  }

  return metadata;
}

/**
 * Create error context from error and error info
 */
export function createErrorContext(
  error: Error,
  _errorInfo: any,
  additionalContext?: Partial<ErrorContext>,
): ErrorContext {
  const analysis = analyzeError(error, _errorInfo);

  return {
    componentStack: _errorInfo?.componentStack?.split("\n") || [],
    errorBoundaryId: generateErrorBoundaryId(),
    timestamp: Date.now(),
    userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
    url: typeof window !== "undefined" ? window.location.href : "",
    sessionId: getSessionId(),
    severity: analysis.severity,
    category: analysis.category,
    recoverable: analysis.recoverable,
    metadata: analysis.metadata,
    errorBoundaryStack: _errorInfo?.errorBoundaryStack,
    ...additionalContext,
  };
}

/**
 * Generate unique error boundary ID
 */
function generateErrorBoundaryId(): string {
  return `error-boundary-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === "undefined") {
    return "server-session";
  }

  let sessionId = sessionStorage.getItem("reynard-session-id");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("reynard-session-id", sessionId);
  }
  return sessionId;
}
