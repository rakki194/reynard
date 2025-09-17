/**
 * Error Reporting System
 *
 * Error reporting utilities for collecting, aggregating, and reporting
 * errors across the Reynard framework.
 */
import { ReynardError } from "./core";
export interface ErrorReport {
    id: string;
    timestamp: number;
    error: {
        name: string;
        message: string;
        code: string;
        stack?: string;
        context?: Record<string, unknown>;
    };
    environment: {
        userAgent: string;
        url: string;
        timestamp: number;
        version: string;
    };
    user?: {
        id?: string;
        sessionId?: string;
    };
    metadata?: Record<string, unknown>;
}
export interface ErrorAggregation {
    errorCode: string;
    count: number;
    firstOccurrence: number;
    lastOccurrence: number;
    samples: ErrorReport[];
    affectedUsers: Set<string>;
}
export interface ErrorReportingConfig {
    enabled: boolean;
    endpoint?: string;
    apiKey?: string;
    batchSize: number;
    flushInterval: number;
    maxRetries: number;
    includeStackTraces: boolean;
    includeUserInfo: boolean;
    includeEnvironmentInfo: boolean;
    filters: ErrorFilter[];
}
export interface ErrorFilter {
    name: string;
    condition: (error: ReynardError) => boolean;
    action: "include" | "exclude" | "sample";
    sampleRate?: number;
}
export declare class ErrorReporter {
    private config;
    private queue;
    private aggregations;
    private flushTimer?;
    private isFlushing;
    constructor(config?: Partial<ErrorReportingConfig>);
    /**
     * Report an error
     */
    report(error: unknown, metadata?: Record<string, unknown>): void;
    /**
     * Flush pending error reports
     */
    flush(): Promise<void>;
    /**
     * Get error aggregations
     */
    getAggregations(): ErrorAggregation[];
    /**
     * Get error statistics
     */
    getStatistics(): {
        totalErrors: number;
        uniqueErrors: number;
        topErrors: Array<{
            code: string;
            count: number;
        }>;
        errorRate: number;
    };
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ErrorReportingConfig>): void;
    /**
     * Clear all data
     */
    clear(): void;
    private createErrorReport;
    private applyFilters;
    private updateAggregations;
    private sendReports;
    private startFlushTimer;
}
/**
 * Create a filter for specific error codes
 */
export declare function createErrorCodeFilter(codes: string[], action?: "include" | "exclude" | "sample", sampleRate?: number): ErrorFilter;
/**
 * Create a filter for specific error sources
 */
export declare function createErrorSourceFilter(sources: string[], action?: "include" | "exclude" | "sample", sampleRate?: number): ErrorFilter;
/**
 * Create a filter for validation errors
 */
export declare function createValidationErrorFilter(action?: "include" | "exclude" | "sample", sampleRate?: number): ErrorFilter;
/**
 * Create a filter for network errors
 */
export declare function createNetworkErrorFilter(action?: "include" | "exclude" | "sample", sampleRate?: number): ErrorFilter;
/**
 * Global error reporter instance
 */
export declare const globalErrorReporter: ErrorReporter;
/**
 * Report an error using the global reporter
 */
export declare function reportError(error: unknown, metadata?: Record<string, unknown>): void;
/**
 * Set up global error reporting
 */
export declare function setupGlobalErrorReporting(config?: Partial<ErrorReportingConfig>): void;
/**
 * Create error report from any error
 */
export declare function createErrorReport(error: unknown, metadata?: Record<string, unknown>): ErrorReport;
/**
 * Format error report for display
 */
export declare function formatErrorReport(report: ErrorReport): string;
