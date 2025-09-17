/**
 * reynard-error-boundaries
 * Comprehensive error boundary system for Reynard framework
 */
export { ErrorBoundary, withErrorBoundary } from "./components/ErrorBoundary";
export { ErrorFallback } from "./components/ErrorFallback";
export { useErrorBoundary } from "./composables/useErrorBoundary";
export { useErrorReporting } from "./composables/useErrorReporting";
export type { ErrorSeverity, ErrorCategory, ErrorInfo, ErrorContext, ErrorReport, ErrorBoundaryConfig, ErrorReportingConfig, ErrorFilter, ErrorFallbackProps, ErrorMetrics, } from "./types/ErrorTypes";
export type { RecoveryAction, RecoveryStrategy, RecoveryResult, RecoveryAction as RecoveryActionType, RecoveryContext, RecoveryOptions, RecoveryState, } from "./types/RecoveryTypes";
export { analyzeError, createErrorContext } from "./utils/ErrorAnalyzer";
export { builtInRecoveryStrategies, getApplicableStrategies, executeRecoveryStrategy, createRecoveryStrategy, } from "./utils/RecoveryStrategies";
export { serializeError, serializeErrorContext, createErrorReport, serializeErrorReport, deserializeErrorReport, } from "./utils/ErrorSerializer";
import "./styles.css";
