/**
 * Error Analysis Utilities
 * Comprehensive error analysis and classification system
 */
import { ErrorSeverity, ErrorCategory, ErrorContext } from "../types/ErrorTypes";
/**
 * Analyze an error and determine its severity and category
 */
export declare function analyzeError(error: Error, errorInfo: any): {
    severity: ErrorSeverity;
    category: ErrorCategory;
    recoverable: boolean;
    metadata: Record<string, unknown>;
};
/**
 * Create error context from error and error info
 */
export declare function createErrorContext(error: Error, _errorInfo: any, additionalContext?: Partial<ErrorContext>): ErrorContext;
