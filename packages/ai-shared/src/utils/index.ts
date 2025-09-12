/**
 * Shared AI/ML Utilities for Reynard
 *
 * This module provides utility functions and classes that are commonly used
 * across AI/ML packages in the Reynard framework. These utilities help with
 * common tasks like validation, error handling, performance monitoring, and
 * data processing.
 *
 * @deprecated ValidationUtils and ErrorUtils are deprecated. Use unified utilities from reynard-connection instead.
 */

import {
  AIError,
  AsyncResult,
  GPUInfo,
  MemoryInfo,
  MultiValidationResult,
  PerformanceMetrics,
  ProgressCallback,
  ValidationResult,
} from "../types/index.js";

// Re-export unified utilities from reynard-connection
export {
  ValidationUtils as UnifiedValidationUtils,
  validateEmail,
  validatePassword,
  validateUrl,
  validateUsername,
  validateValue,
  type FieldValidationOptions,
  type MultiValidationResult as UnifiedMultiValidationResult,
  type ValidationResult as UnifiedValidationResult,
  type ValidationSchema,
} from "reynard-connection";

export {
  errorHandler,
  NetworkError,
  retry,
  ReynardError,
  ValidationError,
  wrapAsync,
  type BaseErrorContext,
} from "reynard-connection";

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * @deprecated Use UnifiedValidationUtils from reynard-connection instead
 * Utility class for validating data and configurations
 */
export class ValidationUtils {
  /**
   * Validate a single value against a schema
   */
  static validateValue(value: any, schema: any): ValidationResult {
    const errors: string[] = [];

    // Check required
    if (schema.required && (value === undefined || value === null)) {
      errors.push(`${schema.name || "field"} is required`);
      return { isValid: false, error: errors[0] };
    }

    // Skip validation if value is empty and not required
    if (
      !schema.required &&
      (value === undefined || value === null || value === "")
    ) {
      return { isValid: true };
    }

    // Type validation
    if (schema.type && typeof value !== schema.type) {
      errors.push(`${schema.name || "field"} must be of type ${schema.type}`);
    }

    // String validation
    if (schema.type === "string" && typeof value === "string") {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(
          `${schema.name || "field"} must be at least ${schema.minLength} characters`,
        );
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(
          `${schema.name || "field"} must be no more than ${schema.maxLength} characters`,
        );
      }
      if (schema.pattern && !schema.pattern.test(value)) {
        errors.push(
          schema.errorMessage || `${schema.name || "field"} format is invalid`,
        );
      }
    }

    // Number validation
    if (
      (schema.type === "number" || schema.type === "range") &&
      typeof value === "number"
    ) {
      if (schema.min !== undefined && value < schema.min) {
        errors.push(`${schema.name || "field"} must be at least ${schema.min}`);
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push(`${schema.name || "field"} must be at most ${schema.max}`);
      }
    }

    // Array validation
    if (schema.type === "array" && Array.isArray(value)) {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push(
          `${schema.name || "field"} must have at least ${schema.minItems} items`,
        );
      }
      if (schema.maxItems && value.length > schema.maxItems) {
        errors.push(
          `${schema.name || "field"} must have at most ${schema.maxItems} items`,
        );
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(
        `${schema.name || "field"} must be one of: ${schema.enum.join(", ")}`,
      );
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
      warnings: errors.slice(1),
    };
  }

  /**
   * Validate multiple values against a schema
   */
  static validateMultiple(
    values: Record<string, any>,
    schema: Record<string, any>,
  ): MultiValidationResult {
    const results: Record<string, ValidationResult> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [key, value] of Object.entries(values)) {
      const fieldSchema = schema[key];
      if (fieldSchema) {
        const result = this.validateValue(value, { ...fieldSchema, name: key });
        results[key] = result;

        if (!result.isValid && result.error) {
          errors.push(result.error);
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      results,
      errors,
      warnings,
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Invalid email format" };
    }
    return { isValid: true };
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): ValidationResult {
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: "Invalid URL format" };
    }
  }

  /**
   * Validate file path
   */
  static validateFilePath(path: string): ValidationResult {
    if (!path || path.trim() === "") {
      return { isValid: false, error: "File path cannot be empty" };
    }
    if (path.includes("..") || path.includes("~")) {
      return { isValid: false, error: "File path contains invalid characters" };
    }
    return { isValid: true };
  }
}

// ============================================================================
// Performance Monitoring Utilities
// ============================================================================

/**
 * Utility class for performance monitoring and metrics collection
 */
export class PerformanceMonitor {
  private static _metrics: PerformanceMetrics[] = [];
  private static _maxMetrics = 1000;

  /**
   * Start timing an operation
   */
  static startTimer(operation: string): () => PerformanceMetrics {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();

    return () => {
      const endTime = Date.now();
      const endMemory = this.getMemoryUsage();

      const metric: PerformanceMetrics = {
        operation,
        duration: endTime - startTime,
        memoryUsage: endMemory.used - startMemory.used,
        cpuUsage: 0, // Would need system-specific implementation
        timestamp: new Date(),
        metadata: {},
      };

      this._addMetric(metric);
      return metric;
    };
  }

  /**
   * Track an operation with custom metadata
   */
  static trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata: Record<string, any> = {},
  ): Promise<T> {
    const timer = this.startTimer(operation);

    return fn().then(
      (result) => {
        const metric = timer();
        metric.metadata = { ...metadata, success: true };
        return result;
      },
      (error) => {
        const metric = timer();
        metric.metadata = { ...metadata, success: false, error: error.message };
        throw error;
      },
    );
  }

  /**
   * Get memory usage information
   */
  static getMemoryUsage(): MemoryInfo {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        total: usage.heapTotal,
        used: usage.heapUsed,
        free: usage.heapTotal - usage.heapUsed,
        available: usage.external + usage.arrayBuffers,
        percentage: (usage.heapUsed / usage.heapTotal) * 100,
      };
    }

    // Fallback for browser environment
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        total: memory.totalJSHeapSize,
        used: memory.usedJSHeapSize,
        free: memory.totalJSHeapSize - memory.usedJSHeapSize,
        available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }

    // Default fallback
    return {
      total: 0,
      used: 0,
      free: 0,
      available: 0,
      percentage: 0,
    };
  }

  /**
   * Get GPU information (placeholder - would need platform-specific implementation)
   */
  static getGPUInfo(): GPUInfo | null {
    // This would need to be implemented with platform-specific code
    // For now, return null to indicate GPU info is not available
    return null;
  }

  /**
   * Get performance metrics
   */
  static getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this._metrics.filter((metric) => metric.operation === operation);
    }
    return [...this._metrics];
  }

  /**
   * Get average performance for an operation
   */
  static getAveragePerformance(operation: string): {
    averageDuration: number;
    averageMemoryUsage: number;
    count: number;
  } {
    const metrics = this._metrics.filter(
      (metric) => metric.operation === operation,
    );

    if (metrics.length === 0) {
      return { averageDuration: 0, averageMemoryUsage: 0, count: 0 };
    }

    const totalDuration = metrics.reduce(
      (sum, metric) => sum + metric.duration,
      0,
    );
    const totalMemory = metrics.reduce(
      (sum, metric) => sum + metric.memoryUsage,
      0,
    );

    return {
      averageDuration: totalDuration / metrics.length,
      averageMemoryUsage: totalMemory / metrics.length,
      count: metrics.length,
    };
  }

  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    this._metrics = [];
  }

  /**
   * Add a metric to the collection
   */
  private static _addMetric(metric: PerformanceMetrics): void {
    this._metrics.push(metric);

    // Keep only the most recent metrics
    if (this._metrics.length > this._maxMetrics) {
      this._metrics = this._metrics.slice(-this._maxMetrics);
    }
  }
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * @deprecated Use unified error handling from reynard-connection instead
 * Utility class for error handling and logging
 */
export class ErrorUtils {
  /**
   * Create a standardized error with context
   */
  static createError(
    message: string,
    code: string,
    context?: Record<string, any>,
  ): AIError {
    return new AIError(message, code, context);
  }

  /**
   * Wrap an async function with error handling
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    errorMessage: string,
    context?: Record<string, any>,
  ): Promise<AsyncResult<T, AIError>> {
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error) {
      const aiError = new AIError(errorMessage, "WRAPPER_ERROR", {
        originalError: error,
        ...context,
      });
      return { success: false, error: aiError };
    }
  }

  /**
   * Retry an operation with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context?: Record<string, any>,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw new AIError(
            `Operation failed after ${maxRetries} retries: ${lastError.message}`,
            "RETRY_EXHAUSTED",
            { originalError: lastError, attempts: maxRetries + 1, ...context },
          );
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Log error with context
   */
  static logError(error: Error, context?: Record<string, any>): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      context,
    };

    console.error("AI/ML Error:", errorInfo);
  }
}

// ============================================================================
// Data Processing Utilities
// ============================================================================

/**
 * Utility class for data processing and transformation
 */
export class DataUtils {
  /**
   * Normalize text by removing extra whitespace and special characters
   */
  static normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s\-.,!?]/g, "");
  }

  /**
   * Clean and format tags
   */
  static cleanTags(tags: string[]): string[] {
    return tags
      .map((tag) => this.normalizeText(tag))
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.toLowerCase())
      .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
  }

  /**
   * Format file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Format duration in human-readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Chunk an array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Debounce a function call
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle a function call
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// ============================================================================
// Progress Tracking Utilities
// ============================================================================

/**
 * Utility class for tracking progress of long-running operations
 */
export class ProgressTracker {
  private _total: number;
  private _completed: number = 0;
  private _callback?: ProgressCallback;
  private _startTime: Date = new Date();

  constructor(total: number, callback?: ProgressCallback) {
    this._total = total;
    this._callback = callback;
  }

  /**
   * Update progress
   */
  update(completed: number, message?: string): void {
    this._completed = Math.min(completed, this._total);
    const progress =
      this._total > 0 ? (this._completed / this._total) * 100 : 0;

    if (this._callback) {
      this._callback(progress, message);
    }
  }

  /**
   * Increment progress
   */
  increment(amount: number = 1, message?: string): void {
    this.update(this._completed + amount, message);
  }

  /**
   * Complete the progress
   */
  complete(message?: string): void {
    this.update(this._total, message);
  }

  /**
   * Get current progress percentage
   */
  get progress(): number {
    return this._total > 0 ? (this._completed / this._total) * 100 : 0;
  }

  /**
   * Get completed count
   */
  get completed(): number {
    return this._completed;
  }

  /**
   * Get total count
   */
  get total(): number {
    return this._total;
  }

  /**
   * Get elapsed time
   */
  get elapsedTime(): number {
    return Date.now() - this._startTime.getTime();
  }

  /**
   * Get estimated time remaining
   */
  get estimatedTimeRemaining(): number {
    if (this._completed === 0) {
      return 0;
    }

    const elapsed = this.elapsedTime;
    const rate = this._completed / elapsed;
    const remaining = this._total - this._completed;

    return remaining / rate;
  }
}

// ============================================================================
// Export all utilities
// ============================================================================

export * from "./index";
