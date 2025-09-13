/**
 * Shared AI/ML Utilities for Reynard
 *
 * This module provides utility functions and classes that are commonly used
 * across AI/ML packages in the Reynard framework. These utilities help with
 * common tasks like validation, error handling, performance monitoring, and
 * data processing.
 */

import {
  PerformanceMetrics,
  ProgressCallback,
} from "../types/index.js";

// Re-export consolidated utilities from reynard-connection
export {
  ValidationUtils,
  validateEmail,
  validatePassword,
  validateUrl,
  validateUsername,
  validateValue,
  validateApiKey,
  validateToken,
  validateModelName,
  validatePrompt,
  validateTemperature,
  validateMaxTokens,
  type ValidationResult,
  type MultiValidationResult,
  type ValidationSchema,
  type FieldValidationOptions,
} from "reynard-connection";

export {
  errorHandler,
  NetworkError,
  retry,
  retryWithExponentialBackoff,
  retryWithLinearBackoff,
  retryWithFixedDelay,
  ReynardError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ProcessingError,
  DatabaseError,
  ConfigurationError,
  TimeoutError,
  RateLimitError,
  wrapAsync,
  type BaseErrorContext,
  type ValidationErrorContext,
  type NetworkErrorContext,
  type AuthenticationErrorContext,
  type ProcessingErrorContext,
  type DatabaseErrorContext,
  type ConfigurationErrorContext,
} from "reynard-connection";

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Performance monitoring utility for AI/ML operations
 */
export class PerformanceMonitor {
  private static _metrics: PerformanceMetrics[] = [];
  private static _maxMetrics = 1000;

  /**
   * Record a performance metric
   */
  static recordMetric(metric: PerformanceMetrics): void {
    this._addMetric(metric);
  }

  /**
   * Get performance metrics
   */
  static getMetrics(): PerformanceMetrics[] {
    return [...this._metrics];
  }

  /**
   * Get average performance metrics
   */
  static getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this._metrics.length === 0) {
      return {};
    }

    const totals = this._metrics.reduce(
      (acc, metric) => ({
        duration: (acc.duration || 0) + metric.duration,
        memoryUsage: (acc.memoryUsage || 0) + metric.memoryUsage,
        cpuUsage: (acc.cpuUsage || 0) + metric.cpuUsage,
        gpuUsage: (acc.gpuUsage || 0) + (metric.gpuUsage || 0),
      }),
      {} as Partial<PerformanceMetrics>,
    );

    const count = this._metrics.length;
    return {
      duration: totals.duration! / count,
      memoryUsage: totals.memoryUsage! / count,
      cpuUsage: totals.cpuUsage! / count,
      gpuUsage: totals.gpuUsage! / count,
    };
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this._metrics = [];
  }

  private static _addMetric(metric: PerformanceMetrics): void {
    this._metrics.push(metric);
    if (this._metrics.length > this._maxMetrics) {
      this._metrics = this._metrics.slice(-this._maxMetrics);
    }
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
      .replace(/[^\w\s-]/g, "")
      .toLowerCase();
  }

  /**
   * Truncate text to specified length
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Convert bytes to human readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Convert milliseconds to human readable format
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    
    const minutes = seconds / 60;
    if (minutes < 60) {
      return `${minutes.toFixed(2)}m`;
    }
    
    const hours = minutes / 60;
    return `${hours.toFixed(2)}h`;
  }

  /**
   * Generate a unique ID
   */
  static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as T;
    }
    
    if (typeof obj === "object") {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    
    return obj;
  }
}

// ============================================================================
// Progress Tracking
// ============================================================================

/**
 * Progress tracking utility for long-running operations
 */
export class ProgressTracker {
  private _progress = 0;
  private _total = 100;
  private _callbacks: ProgressCallback[] = [];

  constructor(total = 100) {
    this._total = total;
  }

  /**
   * Update progress
   */
  update(progress: number): void {
    this._progress = Math.min(Math.max(progress, 0), this._total);
    this._notifyCallbacks();
  }

  /**
   * Increment progress
   */
  increment(amount = 1): void {
    this.update(this._progress + amount);
  }

  /**
   * Set total
   */
  setTotal(total: number): void {
    this._total = total;
    this._notifyCallbacks();
  }

  /**
   * Get current progress
   */
  getProgress(): number {
    return this._progress;
  }

  /**
   * Get progress percentage
   */
  getPercentage(): number {
    return (this._progress / this._total) * 100;
  }

  /**
   * Check if complete
   */
  isComplete(): boolean {
    return this._progress >= this._total;
  }

  /**
   * Add progress callback
   */
  onProgress(callback: ProgressCallback): void {
    this._callbacks.push(callback);
  }

  /**
   * Remove progress callback
   */
  removeCallback(callback: ProgressCallback): void {
    const index = this._callbacks.indexOf(callback);
    if (index > -1) {
      this._callbacks.splice(index, 1);
    }
  }

  /**
   * Reset progress
   */
  reset(): void {
    this._progress = 0;
    this._notifyCallbacks();
  }

  private _notifyCallbacks(): void {
    this._callbacks.forEach(callback => {
      try {
        callback(this._progress);
      } catch (error) {
        console.error("Progress callback error:", error);
      }
    });
  }
}