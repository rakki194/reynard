/**
 * Error Reporting System
 *
 * Error reporting utilities for collecting, aggregating, and reporting
 * errors across the Reynard framework.
 */
import { ReynardError, isReynardError } from "./core";
// ============================================================================
// Error Reporter
// ============================================================================
export class ErrorReporter {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "aggregations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "flushTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isFlushing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.config = {
            enabled: true,
            batchSize: 10,
            flushInterval: 30000, // 30 seconds
            maxRetries: 3,
            includeStackTraces: true,
            includeUserInfo: true,
            includeEnvironmentInfo: true,
            filters: [],
            ...config,
        };
        if (this.config.enabled) {
            this.startFlushTimer();
        }
    }
    /**
     * Report an error
     */
    report(error, metadata) {
        if (!this.config.enabled) {
            return;
        }
        const reynardError = isReynardError(error)
            ? error
            : new ReynardError(error instanceof Error ? error.message : "Unknown error", "UNKNOWN_ERROR", { source: "error-reporter" });
        // Apply filters
        const filterResult = this.applyFilters(reynardError);
        if (filterResult === "exclude") {
            return;
        }
        if (filterResult === "sample" && Math.random() > 0.1) {
            // 10% sample rate
            return;
        }
        const report = this.createErrorReport(reynardError, metadata);
        this.queue.push(report);
        // Update aggregations
        this.updateAggregations(report);
        // Flush if queue is full
        if (this.queue.length >= this.config.batchSize) {
            this.flush();
        }
    }
    /**
     * Flush pending error reports
     */
    async flush() {
        if (this.isFlushing || this.queue.length === 0) {
            return;
        }
        this.isFlushing = true;
        const reports = [...this.queue];
        this.queue = [];
        try {
            if (this.config.endpoint) {
                await this.sendReports(reports);
            }
        }
        catch (error) {
            console.error("Failed to send error reports:", error);
            // Re-queue reports for retry
            this.queue.unshift(...reports);
        }
        finally {
            this.isFlushing = false;
        }
    }
    /**
     * Get error aggregations
     */
    getAggregations() {
        return Array.from(this.aggregations.values());
    }
    /**
     * Get error statistics
     */
    getStatistics() {
        const aggregations = this.getAggregations();
        const totalErrors = aggregations.reduce((sum, agg) => sum + agg.count, 0);
        const uniqueErrors = aggregations.length;
        const topErrors = aggregations
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((agg) => ({ code: agg.errorCode, count: agg.count }));
        return {
            totalErrors,
            uniqueErrors,
            topErrors,
            errorRate: totalErrors /
                Math.max(1, Date.now() -
                    Math.min(...aggregations.map((agg) => agg.firstOccurrence))),
        };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.config.enabled && !this.flushTimer) {
            this.startFlushTimer();
        }
        else if (!this.config.enabled && this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = undefined;
        }
    }
    /**
     * Clear all data
     */
    clear() {
        this.queue = [];
        this.aggregations.clear();
    }
    // ============================================================================
    // Private Methods
    // ============================================================================
    createErrorReport(error, metadata) {
        const report = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            error: {
                name: error.name,
                message: error.message,
                code: error.code,
                context: error.context,
            },
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now(),
                version: "1.0.0", // This should come from package.json
            },
            metadata,
        };
        if (this.config.includeStackTraces) {
            report.error.stack = error.stack;
        }
        if (this.config.includeUserInfo && error.context.userId) {
            report.user = {
                id: error.context.userId,
                sessionId: error.context.sessionId,
            };
        }
        return report;
    }
    applyFilters(error) {
        for (const filter of this.config.filters) {
            if (filter.condition(error)) {
                return filter.action;
            }
        }
        return "include";
    }
    updateAggregations(report) {
        const code = report.error.code;
        const existing = this.aggregations.get(code);
        if (existing) {
            existing.count++;
            existing.lastOccurrence = report.timestamp;
            existing.samples.push(report);
            // Keep only the most recent samples
            if (existing.samples.length > 10) {
                existing.samples = existing.samples.slice(-10);
            }
            if (report.user?.id) {
                existing.affectedUsers.add(report.user.id);
            }
        }
        else {
            this.aggregations.set(code, {
                errorCode: code,
                count: 1,
                firstOccurrence: report.timestamp,
                lastOccurrence: report.timestamp,
                samples: [report],
                affectedUsers: new Set(report.user?.id ? [report.user.id] : []),
            });
        }
    }
    async sendReports(reports) {
        if (!this.config.endpoint) {
            return;
        }
        const response = await fetch(this.config.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(this.config.apiKey && {
                    Authorization: `Bearer ${this.config.apiKey}`,
                }),
            },
            body: JSON.stringify({ reports }),
        });
        if (!response.ok) {
            throw new Error(`Failed to send error reports: ${response.status} ${response.statusText}`);
        }
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }
}
// ============================================================================
// Error Filters
// ============================================================================
/**
 * Create a filter for specific error codes
 */
export function createErrorCodeFilter(codes, action = "exclude", sampleRate) {
    return {
        name: `error-code-${action}`,
        condition: (error) => codes.includes(error.code),
        action,
        sampleRate,
    };
}
/**
 * Create a filter for specific error sources
 */
export function createErrorSourceFilter(sources, action = "exclude", sampleRate) {
    return {
        name: `error-source-${action}`,
        condition: (error) => sources.includes(error.context.source),
        action,
        sampleRate,
    };
}
/**
 * Create a filter for validation errors
 */
export function createValidationErrorFilter(action = "exclude", sampleRate) {
    return {
        name: "validation-error-filter",
        condition: (error) => error.code === "VALIDATION_ERROR",
        action,
        sampleRate,
    };
}
/**
 * Create a filter for network errors
 */
export function createNetworkErrorFilter(action = "sample", sampleRate = 0.1) {
    return {
        name: "network-error-filter",
        condition: (error) => error.code === "NETWORK_ERROR",
        action,
        sampleRate,
    };
}
// ============================================================================
// Global Error Reporter
// ============================================================================
/**
 * Global error reporter instance
 */
export const globalErrorReporter = new ErrorReporter({
    enabled: true,
    batchSize: 10,
    flushInterval: 30000,
    includeStackTraces: true,
    includeUserInfo: true,
    includeEnvironmentInfo: true,
    filters: [
        createValidationErrorFilter("exclude"),
        createNetworkErrorFilter("sample", 0.1),
    ],
});
/**
 * Report an error using the global reporter
 */
export function reportError(error, metadata) {
    globalErrorReporter.report(error, metadata);
}
/**
 * Set up global error reporting
 */
export function setupGlobalErrorReporting(config = {}) {
    globalErrorReporter.updateConfig(config);
}
// ============================================================================
// Error Reporting Utilities
// ============================================================================
/**
 * Create error report from any error
 */
export function createErrorReport(error, metadata) {
    const reynardError = isReynardError(error)
        ? error
        : new ReynardError(error instanceof Error ? error.message : "Unknown error", "UNKNOWN_ERROR", { source: "error-reporter" });
    return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        error: {
            name: reynardError.name,
            message: reynardError.message,
            code: reynardError.code,
            context: reynardError.context,
            stack: reynardError.stack,
        },
        environment: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
            version: "1.0.0",
        },
        metadata,
    };
}
/**
 * Format error report for display
 */
export function formatErrorReport(report) {
    const lines = [
        `Error Report: ${report.id}`,
        `Timestamp: ${new Date(report.timestamp).toISOString()}`,
        `Error: ${report.error.name} (${report.error.code})`,
        `Message: ${report.error.message}`,
        `Environment: ${report.environment.userAgent}`,
        `URL: ${report.environment.url}`,
    ];
    if (report.user?.id) {
        lines.push(`User: ${report.user.id}`);
    }
    if (report.metadata) {
        lines.push(`Metadata: ${JSON.stringify(report.metadata, null, 2)}`);
    }
    if (report.error.stack) {
        lines.push(`Stack Trace:\n${report.error.stack}`);
    }
    return lines.join("\n");
}
