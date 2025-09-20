/**
 * reynard-error-boundaries
 * Comprehensive error boundary system for Reynard framework
 */

// Export main components
export { ErrorBoundary, withErrorBoundary } from "./components/ErrorBoundary";
export { ErrorFallback } from "./components/ErrorFallback";

// Export composables
export { useErrorBoundary } from "./composables/useErrorBoundary";
export { useErrorReporting } from "./composables/useErrorReporting";

// Export types
export type {
  ErrorSeverity,
  ErrorCategory,
  ErrorInfo,
  ErrorContext,
  ErrorReport,
  ErrorBoundaryConfig,
  ErrorReportingConfig,
  ErrorFilter,
  ErrorFallbackProps,
  ErrorMetrics,
} from "./types/ErrorTypes";

export type {
  RecoveryAction,
  RecoveryStrategy,
  RecoveryResult,
  RecoveryAction as RecoveryActionType,
  RecoveryContext,
  RecoveryOptions,
  RecoveryState,
} from "./types/RecoveryTypes";

// Export utilities
export { analyzeError, createErrorContext } from "./utils/ErrorAnalyzer";

export {
  builtInRecoveryStrategies,
  getApplicableStrategies,
  executeRecoveryStrategy,
  createRecoveryStrategy,
} from "./utils/RecoveryStrategies";

export {
  serializeError,
  serializeErrorContext,
  createErrorReport,
  serializeErrorReport,
  deserializeErrorReport,
} from "./utils/ErrorSerializer";

// Export styles
import "./styles.css";
