/**
 * 🦊 Diffusion-Pipe Error Handling
 *
 * Custom error classes for diffusion-pipe operations with
 * comprehensive error information and recovery suggestions.
 */

import { ERROR_CODES } from "../constants";

/**
 * Base error class for all diffusion-pipe related errors
 */
export class DiffusionPipeError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, any>;
  public readonly recoverable: boolean;

  constructor(
    message: string,
    code: string = "DIFFUSION_PIPE_ERROR",
    statusCode?: number,
    details?: Record<string, any>,
    recoverable: boolean = true
  ) {
    super(message);
    this.name = "DiffusionPipeError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.recoverable = recoverable;
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      recoverable: this.recoverable,
      stack: this.stack,
    };
  }
}

/**
 * Training-specific error
 */
export class TrainingError extends DiffusionPipeError {
  public readonly trainingId?: string;

  constructor(
    message: string,
    trainingId?: string,
    code: string = ERROR_CODES.TRAINING_FAILED,
    details?: Record<string, any>
  ) {
    super(message, code, 500, details, true);
    this.name = "TrainingError";
    this.trainingId = trainingId;
  }
}

/**
 * Configuration validation error
 */
export class ConfigValidationError extends DiffusionPipeError {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[], details?: Record<string, any>) {
    super(message, ERROR_CODES.CONFIG_INVALID, 400, details, true);
    this.name = "ConfigValidationError";
    this.validationErrors = validationErrors;
  }
}

/**
 * Model not found error
 */
export class ModelNotFoundError extends DiffusionPipeError {
  public readonly modelType: string;

  constructor(modelType: string, details?: Record<string, any>) {
    super(`Model type '${modelType}' not found`, ERROR_CODES.MODEL_NOT_FOUND, 404, details, true);
    this.name = "ModelNotFoundError";
    this.modelType = modelType;
  }
}

/**
 * Dataset not found error
 */
export class DatasetNotFoundError extends DiffusionPipeError {
  public readonly datasetPath: string;

  constructor(datasetPath: string, details?: Record<string, any>) {
    super(`Dataset not found at path: ${datasetPath}`, ERROR_CODES.DATASET_NOT_FOUND, 404, details, true);
    this.name = "DatasetNotFoundError";
    this.datasetPath = datasetPath;
  }
}

/**
 * Permission denied error
 */
export class PermissionDeniedError extends DiffusionPipeError {
  constructor(message: string = "Permission denied", details?: Record<string, any>) {
    super(message, ERROR_CODES.PERMISSION_DENIED, 403, details, false);
    this.name = "PermissionDeniedError";
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends DiffusionPipeError {
  public readonly retryAfter?: number;

  constructor(message: string = "Rate limit exceeded", retryAfter?: number, details?: Record<string, any>) {
    super(message, ERROR_CODES.RATE_LIMITED, 429, details, true);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * WebSocket connection error
 */
export class WebSocketConnectionError extends DiffusionPipeError {
  public readonly url: string;

  constructor(url: string, message: string = "WebSocket connection failed", details?: Record<string, any>) {
    super(message, ERROR_CODES.WEBSOCKET_CONNECTION_FAILED, undefined, details, true);
    this.name = "WebSocketConnectionError";
    this.url = url;
  }
}

/**
 * Network error
 */
export class NetworkError extends DiffusionPipeError {
  public readonly url: string;
  public readonly method: string;

  constructor(
    url: string,
    method: string,
    message: string = "Network request failed",
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message, "NETWORK_ERROR", statusCode, details, true);
    this.name = "NetworkError";
    this.url = url;
    this.method = method;
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends DiffusionPipeError {
  public readonly timeout: number;
  public readonly operation: string;

  constructor(operation: string, timeout: number, message?: string) {
    super(
      message || `Operation '${operation}' timed out after ${timeout}ms`,
      "TIMEOUT_ERROR",
      408,
      { operation, timeout },
      true
    );
    this.name = "TimeoutError";
    this.operation = operation;
    this.timeout = timeout;
  }
}

/**
 * Check if an error is a diffusion-pipe error
 */
export function isDiffusionPipeError(error: any): error is DiffusionPipeError {
  return error instanceof DiffusionPipeError;
}

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: any): boolean {
  if (isDiffusionPipeError(error)) {
    return error.recoverable;
  }
  return false;
}

/**
 * Get error recovery suggestions
 */
export function getErrorRecoverySuggestions(error: DiffusionPipeError): string[] {
  const suggestions: string[] = [];

  switch (error.code) {
    case ERROR_CODES.TRAINING_FAILED:
      suggestions.push("Check training configuration for errors");
      suggestions.push("Verify dataset paths and model files exist");
      suggestions.push("Check GPU memory availability");
      break;

    case ERROR_CODES.CONFIG_INVALID:
      suggestions.push("Validate configuration against schema");
      suggestions.push("Check required fields are present");
      suggestions.push("Verify file paths are accessible");
      break;

    case ERROR_CODES.MODEL_NOT_FOUND:
      suggestions.push("Verify model type is supported");
      suggestions.push("Check model files are properly installed");
      suggestions.push("Update model registry");
      break;

    case ERROR_CODES.DATASET_NOT_FOUND:
      suggestions.push("Verify dataset path exists");
      suggestions.push("Check file permissions");
      suggestions.push("Validate dataset format");
      break;

    case ERROR_CODES.PERMISSION_DENIED:
      suggestions.push("Check user authentication");
      suggestions.push("Verify file permissions");
      suggestions.push("Contact administrator");
      break;

    case ERROR_CODES.RATE_LIMITED:
      suggestions.push("Wait before retrying");
      suggestions.push("Reduce request frequency");
      suggestions.push("Check rate limit settings");
      break;

    case ERROR_CODES.WEBSOCKET_CONNECTION_FAILED:
      suggestions.push("Check network connectivity");
      suggestions.push("Verify WebSocket endpoint");
      suggestions.push("Retry connection");
      break;

    default:
      suggestions.push("Check error details for more information");
      suggestions.push("Retry the operation");
      suggestions.push("Contact support if issue persists");
  }

  return suggestions;
}
