/**
 * Shared AI/ML Utilities for Reynard
 *
 * This module provides utility functions and classes that are commonly used
 * across AI/ML packages in the Reynard framework. These utilities help with
 * common tasks like validation, error handling, performance monitoring, and
 * data processing.
 */
import { PerformanceMetrics, ProgressCallback } from "../types/index.js";
export { ValidationUtils, validateApiKey, validateEmail, validateMaxTokens, validateModelName, validatePassword, validatePrompt, validateTemperature, validateToken, validateUrl, validateUsername, validateValue, type FieldValidationOptions, type MultiValidationResult, type ValidationResult, type ValidationSchema, } from "reynard-validation";
export { AuthenticationError, AuthorizationError, ConfigurationError, DatabaseError, NetworkError, ProcessingError, RateLimitError, ReynardError, TimeoutError, ValidationError, errorHandler, retry, retryWithExponentialBackoff, retryWithFixedDelay, retryWithLinearBackoff, wrapAsync, type AuthenticationErrorContext, type BaseErrorContext, type ConfigurationErrorContext, type DatabaseErrorContext, type NetworkErrorContext, type ProcessingErrorContext, type ValidationErrorContext, } from "reynard-connection";
/**
 * Performance monitoring utility for AI/ML operations
 */
export declare class PerformanceMonitor {
    private static _metrics;
    private static _maxMetrics;
    /**
     * Record a performance metric
     */
    static recordMetric(metric: PerformanceMetrics): void;
    /**
     * Get performance metrics
     */
    static getMetrics(): PerformanceMetrics[];
    /**
     * Get average performance metrics
     */
    static getAverageMetrics(): Partial<PerformanceMetrics>;
    /**
     * Clear all metrics
     */
    static clearMetrics(): void;
    private static _addMetric;
}
/**
 * Utility class for data processing and transformation
 */
export declare class DataUtils {
    /**
     * Normalize text by removing extra whitespace and special characters
     */
    static normalizeText(text: string): string;
    /**
     * Truncate text to specified length
     */
    static truncateText(text: string, maxLength: number): string;
    /**
     * Convert bytes to human readable format
     */
    static formatBytes(bytes: number): string;
    /**
     * Convert milliseconds to human readable format
     */
    static formatDuration(milliseconds: number): string;
    /**
     * Generate a unique ID
     */
    static generateId(): string;
    /**
     * Deep clone an object
     */
    static deepClone<T>(obj: T): T;
}
/**
 * Progress tracking utility for long-running operations
 */
export declare class ProgressTracker {
    private _progress;
    private _total;
    private _callbacks;
    constructor(total?: number);
    /**
     * Update progress
     */
    update(progress: number): void;
    /**
     * Increment progress
     */
    increment(amount?: number): void;
    /**
     * Set total
     */
    setTotal(total: number): void;
    /**
     * Get current progress
     */
    getProgress(): number;
    /**
     * Get progress percentage
     */
    getPercentage(): number;
    /**
     * Check if complete
     */
    isComplete(): boolean;
    /**
     * Add progress callback
     */
    onProgress(callback: ProgressCallback): void;
    /**
     * Remove progress callback
     */
    removeCallback(callback: ProgressCallback): void;
    /**
     * Reset progress
     */
    reset(): void;
    private _notifyCallbacks;
}
