/**
 * Error Serialization Utilities
 * Safe error serialization for reporting and storage
 */
import { ErrorReport, ErrorContext } from "../types/ErrorTypes";
/**
 * Safely serialize an error for reporting
 */
export declare function serializeError(error: Error): {
    name: string;
    message: string;
    stack?: string;
};
/**
 * Safely serialize error context
 */
export declare function serializeErrorContext(context: ErrorContext): Partial<ErrorContext>;
/**
 * Create error report from error and context
 */
export declare function createErrorReport(error: Error, context: ErrorContext, userReport?: string): ErrorReport;
/**
 * Serialize error report for transmission
 */
export declare function serializeErrorReport(report: ErrorReport): string;
/**
 * Deserialize error report from string
 */
export declare function deserializeErrorReport(serialized: string): ErrorReport | null;
