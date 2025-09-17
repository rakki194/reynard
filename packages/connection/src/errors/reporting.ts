/**
 * Error Reporting System
 *
 * Error reporting utilities for collecting, aggregating, and reporting
 * errors across the Reynard framework.
 */

import { ReynardError, isReynardError, extractErrorDetails } from "./core";

// ============================================================================
// Error Report Types
// ============================================================================

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

// ============================================================================
// Error Reporter
// ============================================================================

export class ErrorReporter {
  private config: ErrorReportingConfig;
  private queue: ErrorReport[] = [];
  private aggregations: Map<string, ErrorAggregation> = new Map();
  private flushTimer?: NodeJS.Timeout;
  private isFlushing = false;

  constructor(config: Partial<ErrorReportingConfig> = {}) {
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
  report(error: unknown, metadata?: Record<string, unknown>): void {
    if (!this.config.enabled) {
      return;
    }

    const reynardError = isReynardError(error)
      ? error
      : new ReynardError(error instanceof Error ? error.message : "Unknown error", "UNKNOWN_ERROR", {
          source: "error-reporter",
        });

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
  async flush(): Promise<void> {
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
    } catch (error) {
      console.error("Failed to send error reports:", error);
      // Re-queue reports for retry
      this.queue.unshift(...reports);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Get error aggregations
   */
  getAggregations(): ErrorAggregation[] {
    return Array.from(this.aggregations.values());
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    totalErrors: number;
    uniqueErrors: number;
    topErrors: Array<{ code: string; count: number }>;
    errorRate: number;
  } {
    const aggregations = this.getAggregations();
    const totalErrors = aggregations.reduce((sum, agg) => sum + agg.count, 0);
    const uniqueErrors = aggregations.length;
    const topErrors = aggregations
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(agg => ({ code: agg.errorCode, count: agg.count }));

    return {
      totalErrors,
      uniqueErrors,
      topErrors,
      errorRate: totalErrors / Math.max(1, Date.now() - Math.min(...aggregations.map(agg => agg.firstOccurrence))),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.enabled && !this.flushTimer) {
      this.startFlushTimer();
    } else if (!this.config.enabled && this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.queue = [];
    this.aggregations.clear();
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private createErrorReport(error: ReynardError, metadata?: Record<string, unknown>): ErrorReport {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        context: error.context as unknown as Record<string, unknown>,
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

  private applyFilters(error: ReynardError): "include" | "exclude" | "sample" {
    for (const filter of this.config.filters) {
      if (filter.condition(error)) {
        return filter.action;
      }
    }
    return "include";
  }

  private updateAggregations(report: ErrorReport): void {
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
    } else {
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

  private async sendReports(reports: ErrorReport[]): Promise<void> {
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

  private startFlushTimer(): void {
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
export function createErrorCodeFilter(
  codes: string[],
  action: "include" | "exclude" | "sample" = "exclude",
  sampleRate?: number
): ErrorFilter {
  return {
    name: `error-code-${action}`,
    condition: (error: ReynardError) => codes.includes(error.code),
    action,
    sampleRate,
  };
}

/**
 * Create a filter for specific error sources
 */
export function createErrorSourceFilter(
  sources: string[],
  action: "include" | "exclude" | "sample" = "exclude",
  sampleRate?: number
): ErrorFilter {
  return {
    name: `error-source-${action}`,
    condition: (error: ReynardError) => sources.includes(error.context.source),
    action,
    sampleRate,
  };
}

/**
 * Create a filter for validation errors
 */
export function createValidationErrorFilter(
  action: "include" | "exclude" | "sample" = "exclude",
  sampleRate?: number
): ErrorFilter {
  return {
    name: "validation-error-filter",
    condition: (error: ReynardError) => error.code === "VALIDATION_ERROR",
    action,
    sampleRate,
  };
}

/**
 * Create a filter for network errors
 */
export function createNetworkErrorFilter(
  action: "include" | "exclude" | "sample" = "sample",
  sampleRate = 0.1
): ErrorFilter {
  return {
    name: "network-error-filter",
    condition: (error: ReynardError) => error.code === "NETWORK_ERROR",
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
  filters: [createValidationErrorFilter("exclude"), createNetworkErrorFilter("sample", 0.1)],
});

/**
 * Report an error using the global reporter
 */
export function reportError(error: unknown, metadata?: Record<string, unknown>): void {
  globalErrorReporter.report(error, metadata);
}

/**
 * Set up global error reporting
 */
export function setupGlobalErrorReporting(config: Partial<ErrorReportingConfig> = {}): void {
  globalErrorReporter.updateConfig(config);
}

// ============================================================================
// Error Reporting Utilities
// ============================================================================

/**
 * Create error report from any error
 */
export function createErrorReport(error: unknown, metadata?: Record<string, unknown>): ErrorReport {
  const reynardError = isReynardError(error)
    ? error
    : new ReynardError(error instanceof Error ? error.message : "Unknown error", "UNKNOWN_ERROR", {
        source: "error-reporter",
      });

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    error: {
      name: reynardError.name,
      message: reynardError.message,
      code: reynardError.code,
      context: reynardError.context as unknown as Record<string, unknown>,
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
export function formatErrorReport(report: ErrorReport): string {
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
