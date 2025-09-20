/**
 * Error Reporting Composable
 * Hook for managing error reporting and analytics
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { ErrorReport, ErrorReportingConfig, ErrorFilter } from "../types/ErrorTypes";
import { createErrorReport } from "../utils/ErrorSerializer";

interface UseErrorReportingOptions extends ErrorReportingConfig {
  onReport?: (report: ErrorReport) => void;
  onBatchReport?: (reports: ErrorReport[]) => void;
}

interface UseErrorReportingReturn {
  reports: () => ErrorReport[];
  reportError: (error: Error, context: any, userReport?: string) => Promise<void>;
  flushReports: () => Promise<void>;
  clearReports: () => void;
  getMetrics: () => ErrorMetrics;
}

interface ErrorMetrics {
  totalReports: number;
  reportsByCategory: Record<string, number>;
  reportsBySeverity: Record<string, number>;
  averageReportsPerHour: number;
  lastReportTime?: number;
}

export function useErrorReporting(options: UseErrorReportingOptions = { enabled: true }): UseErrorReportingReturn {
  const [reports, setReports] = createSignal<ErrorReport[]>([]);

  // Default options
  const config = {
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    includeStackTrace: true,
    includeUserContext: true,
    filters: [],
    ...options,
  };

  // Auto-flush reports at intervals
  let flushInterval: NodeJS.Timeout | undefined;

  createEffect(() => {
    if (config.enabled && config.flushInterval && config.flushInterval > 0) {
      flushInterval = setInterval(() => {
        if (reports().length > 0) {
          flushReports();
        }
      }, config.flushInterval);
    }

    onCleanup(() => {
      if (flushInterval) {
        clearInterval(flushInterval);
      }
    });
  });

  // Check if report should be included based on filters
  const shouldReport = (report: ErrorReport, filters: ErrorFilter[]): boolean => {
    if (filters.length === 0) return true;

    for (const filter of filters) {
      let value: any;

      switch (filter.type) {
        case "severity":
          value = report.context.severity;
          break;
        case "category":
          value = report.context.category;
          break;
        case "message":
          value = report.error.message;
          break;
        case "component":
          value = report.context.componentStack.join(" ");
          break;
        default:
          continue;
      }

      const matches =
        value === filter.value ||
        (typeof value === "string" && typeof filter.value === "string" && value.includes(filter.value));

      if (filter.action === "include" && !matches) {
        return false;
      }
      if (filter.action === "exclude" && matches) {
        return false;
      }
    }

    return true;
  };

  // Report an error
  const reportError = async (error: Error, context: any, userReport?: string): Promise<void> => {
    if (!config.enabled) return;

    try {
      const report = createErrorReport(error, context, userReport);

      // Apply filters
      if (!shouldReport(report, config.filters || [])) {
        return;
      }

      // Add to reports
      setReports(prev => [...prev, report]);

      // Call user callback
      options.onReport?.(report);

      // Auto-flush if batch size reached
      if (reports().length >= (config.batchSize || 10)) {
        await flushReports();
      }
    } catch (reportError) {
      console.warn("Failed to create error report:", reportError);
    }
  };

  // Flush reports to external service
  const flushReports = async (): Promise<void> => {
    const currentReports = reports();
    if (currentReports.length === 0) return;

    try {
      if (config.endpoint) {
        const response = await fetch(config.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config.apiKey && {
              Authorization: `Bearer ${config.apiKey}`,
            }),
          },
          body: JSON.stringify({
            reports: currentReports,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Call user batch callback
      options.onBatchReport?.(currentReports);

      // Clear reports after successful flush
      setReports([]);
    } catch (error) {
      console.warn("Failed to flush error reports:", error);
      // Keep reports for retry
    }
  };

  // Clear all reports
  const clearReports = (): void => {
    setReports([]);
  };

  // Get error metrics
  const getMetrics = (): ErrorMetrics => {
    const currentReports = reports();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Filter reports from last hour
    const recentReports = currentReports.filter(report => report.timestamp > oneHourAgo);

    // Calculate metrics
    const reportsByCategory: Record<string, number> = {};
    const reportsBySeverity: Record<string, number> = {};

    currentReports.forEach(report => {
      const category = report.context.category;
      const severity = report.context.severity;

      reportsByCategory[category] = (reportsByCategory[category] || 0) + 1;
      reportsBySeverity[severity] = (reportsBySeverity[severity] || 0) + 1;
    });

    const lastReport = currentReports.length > 0 ? Math.max(...currentReports.map(r => r.timestamp)) : undefined;

    return {
      totalReports: currentReports.length,
      reportsByCategory,
      reportsBySeverity,
      averageReportsPerHour: recentReports.length,
      lastReportTime: lastReport,
    };
  };

  // Cleanup on unmount
  onCleanup(() => {
    if (flushInterval) {
      clearInterval(flushInterval);
    }
  });

  return {
    reports,
    reportError,
    flushReports,
    clearReports,
    getMetrics,
  };
}
