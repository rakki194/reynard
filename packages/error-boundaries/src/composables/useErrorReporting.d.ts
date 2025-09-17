/**
 * Error Reporting Composable
 * Hook for managing error reporting and analytics
 */
import { ErrorReport, ErrorReportingConfig } from "../types/ErrorTypes";
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
export declare function useErrorReporting(options?: UseErrorReportingOptions): UseErrorReportingReturn;
export {};
