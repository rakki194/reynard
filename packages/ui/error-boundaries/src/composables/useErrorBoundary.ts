/**
 * Error Boundary Composable
 * Hook for managing error boundary state and actions
 */

import { createSignal, createMemo, onCleanup } from "solid-js";
import { ErrorContext } from "../types/ErrorTypes";
import { RecoveryAction, RecoveryStrategy } from "../types/RecoveryTypes";
import { createErrorContext } from "../utils/ErrorAnalyzer";
import { getApplicableStrategies, executeRecoveryStrategy } from "../utils/RecoveryStrategies";

interface UseErrorBoundaryOptions {
  recoveryStrategies?: RecoveryStrategy[];
  onError?: (error: Error, context: ErrorContext) => void;
  onRecovery?: (action: RecoveryAction) => void;
  isolate?: boolean;
}

interface UseErrorBoundaryReturn {
  error: () => Error | null;
  errorContext: () => ErrorContext | null;
  isRecovering: () => boolean;
  recoveryActions: () => RecoveryAction[];
  handleError: (error: Error, errorInfo: any) => void;
  retry: () => void;
  reset: () => void;
  executeRecovery: (action: RecoveryAction) => Promise<void>;
  clearError: () => void;
}

export function useErrorBoundary(options: UseErrorBoundaryOptions = {}): UseErrorBoundaryReturn {
  const [error, setError] = createSignal<Error | null>(null);
  const [errorInfo, setErrorInfo] = createSignal<any>(null);
  const [isRecovering, setIsRecovering] = createSignal(false);
  const [recoveryActions, setRecoveryActions] = createSignal<RecoveryAction[]>([]);

  // Create error context when error occurs
  const errorContext = createMemo(() => {
    const currentError = error();
    const currentErrorInfo = errorInfo();
    if (!currentError || !currentErrorInfo) return null;

    return createErrorContext(currentError, currentErrorInfo);
  });

  // Handle error occurrence
  const handleError = (error: Error, errorInfo: any) => {
    console.error("useErrorBoundary caught error:", error, errorInfo);

    setError(error);
    setErrorInfo(errorInfo);

    // Create error context
    const context = createErrorContext(error, errorInfo);

    // Get applicable recovery strategies
    const strategies = getApplicableStrategies(error, context, options.recoveryStrategies);

    // Convert strategies to recovery actions
    const actions: RecoveryAction[] = strategies.map(strategy => ({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      action: strategy.id as any,
      priority: strategy.priority,
      timeout: strategy.timeout,
    }));

    setRecoveryActions(actions);

    // Call user error handler
    options.onError?.(error, context);
  };

  // Clear error state
  const clearError = () => {
    setError(null);
    setErrorInfo(null);
    setRecoveryActions([]);
    setIsRecovering(false);
  };

  // Retry the operation
  const retry = () => {
    clearError();
  };

  // Reset the component
  const reset = () => {
    clearError();
    // Additional reset logic could go here
  };

  // Execute recovery action
  const executeRecovery = async (action: RecoveryAction) => {
    const currentError = error();
    const currentContext = errorContext();

    if (!currentError || !currentContext) return;

    setIsRecovering(true);

    try {
      // Find the strategy for this action
      const strategy = options.recoveryStrategies?.find(s => s.id === action.id);
      if (!strategy) {
        throw new Error(`Recovery strategy not found: ${action.id}`);
      }

      // Execute the recovery strategy
      const result = await executeRecoveryStrategy(strategy, currentError, currentContext);

      if (result.success) {
        // Call user recovery handler
        options.onRecovery?.(action);

        // Clear error state
        clearError();
      } else {
        console.error("Recovery failed:", result.error);
      }
    } catch (recoveryError) {
      console.error("Recovery execution failed:", recoveryError);
    } finally {
      setIsRecovering(false);
    }
  };

  // Global error handler
  const handleGlobalError = (event: ErrorEvent) => {
    if (options.isolate) {
      event.preventDefault();
      handleError(new Error(event.message), {
        componentStack: "Global error",
        errorBoundary: "global",
      });
    }
  };

  // Global unhandled rejection handler
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (options.isolate) {
      event.preventDefault();
      handleError(new Error(String(event.reason)), {
        componentStack: "Unhandled promise rejection",
        errorBoundary: "global",
      });
    }
  };

  // Set up global error handlers
  if (typeof window !== "undefined" && options.isolate) {
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    onCleanup(() => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    });
  }

  return {
    error,
    errorContext,
    isRecovering,
    recoveryActions,
    handleError,
    retry,
    reset,
    executeRecovery,
    clearError,
  };
}
