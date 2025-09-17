/**
 * Shared AI/ML Utilities for Reynard
 *
 * This module provides utility functions and classes that are commonly used
 * across AI/ML packages in the Reynard framework. These utilities help with
 * common tasks like validation, error handling, performance monitoring, and
 * data processing.
 */
// Re-export consolidated utilities from reynard-validation
export { ValidationUtils, validateApiKey, validateEmail, validateMaxTokens, validateModelName, validatePassword, validatePrompt, validateTemperature, validateToken, validateUrl, validateUsername, validateValue, } from "reynard-validation";
export { AuthenticationError, AuthorizationError, ConfigurationError, DatabaseError, NetworkError, ProcessingError, RateLimitError, ReynardError, TimeoutError, ValidationError, errorHandler, retry, retryWithExponentialBackoff, retryWithFixedDelay, retryWithLinearBackoff, wrapAsync, } from "reynard-connection";
// ============================================================================
// Performance Monitoring
// ============================================================================
/**
 * Performance monitoring utility for AI/ML operations
 */
export class PerformanceMonitor {
    /**
     * Record a performance metric
     */
    static recordMetric(metric) {
        this._addMetric(metric);
    }
    /**
     * Get performance metrics
     */
    static getMetrics() {
        return [...this._metrics];
    }
    /**
     * Get average performance metrics
     */
    static getAverageMetrics() {
        if (this._metrics.length === 0) {
            return {};
        }
        const totals = this._metrics.reduce((acc, metric) => ({
            duration: (acc.duration || 0) + metric.duration,
            memoryUsage: (acc.memoryUsage || 0) + metric.memoryUsage,
            cpuUsage: (acc.cpuUsage || 0) + metric.cpuUsage,
            gpuUsage: (acc.gpuUsage || 0) + (metric.gpuUsage || 0),
        }), {});
        const count = this._metrics.length;
        return {
            duration: totals.duration / count,
            memoryUsage: totals.memoryUsage / count,
            cpuUsage: totals.cpuUsage / count,
            gpuUsage: totals.gpuUsage / count,
        };
    }
    /**
     * Clear all metrics
     */
    static clearMetrics() {
        this._metrics = [];
    }
    static _addMetric(metric) {
        this._metrics.push(metric);
        if (this._metrics.length > this._maxMetrics) {
            this._metrics = this._metrics.slice(-this._maxMetrics);
        }
    }
}
Object.defineProperty(PerformanceMonitor, "_metrics", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: []
});
Object.defineProperty(PerformanceMonitor, "_maxMetrics", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1000
});
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
    static normalizeText(text) {
        return text
            .trim()
            .replace(/\s+/g, " ")
            .replace(/[^\w\s-]/g, "")
            .toLowerCase();
    }
    /**
     * Truncate text to specified length
     */
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + "...";
    }
    /**
     * Convert bytes to human readable format
     */
    static formatBytes(bytes) {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    /**
     * Convert milliseconds to human readable format
     */
    static formatDuration(milliseconds) {
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
    static generateId() {
        return crypto.randomUUID();
    }
    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (typeof obj === "object") {
            const cloned = {};
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
    constructor(total = 100) {
        Object.defineProperty(this, "_progress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_total", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        Object.defineProperty(this, "_callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this._total = total;
    }
    /**
     * Update progress
     */
    update(progress) {
        this._progress = Math.min(Math.max(progress, 0), this._total);
        this._notifyCallbacks();
    }
    /**
     * Increment progress
     */
    increment(amount = 1) {
        this.update(this._progress + amount);
    }
    /**
     * Set total
     */
    setTotal(total) {
        this._total = total;
        this._notifyCallbacks();
    }
    /**
     * Get current progress
     */
    getProgress() {
        return this._progress;
    }
    /**
     * Get progress percentage
     */
    getPercentage() {
        return (this._progress / this._total) * 100;
    }
    /**
     * Check if complete
     */
    isComplete() {
        return this._progress >= this._total;
    }
    /**
     * Add progress callback
     */
    onProgress(callback) {
        this._callbacks.push(callback);
    }
    /**
     * Remove progress callback
     */
    removeCallback(callback) {
        const index = this._callbacks.indexOf(callback);
        if (index > -1) {
            this._callbacks.splice(index, 1);
        }
    }
    /**
     * Reset progress
     */
    reset() {
        this._progress = 0;
        this._notifyCallbacks();
    }
    _notifyCallbacks() {
        this._callbacks.forEach(callback => {
            try {
                callback(this._progress);
            }
            catch (error) {
                console.error("Progress callback error:", error);
            }
        });
    }
}
