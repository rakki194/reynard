/**
 * Main Error Boundary Component
 * Comprehensive error boundary with recovery and reporting capabilities
 */

import { Component, createSignal, createMemo, Show, onCleanup, JSX } from 'solid-js';
import { ErrorBoundaryConfig } from '../types/ErrorTypes';
import { RecoveryAction } from '../types/RecoveryTypes';
import { createErrorContext } from '../utils/ErrorAnalyzer';
import { getApplicableStrategies, executeRecoveryStrategy } from '../utils/RecoveryStrategies';
import { createErrorReport } from '../utils/ErrorSerializer';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: any;
  isRecovering: boolean;
  recoveryActions: RecoveryAction[];
  lastRecoveryAttempt?: number;
}

export const ErrorBoundary: Component<ErrorBoundaryConfig & { children: JSX.Element }> = (props) => {
  const [state, setState] = createSignal<ErrorBoundaryState>({
    error: null,
    errorInfo: null,
    isRecovering: false,
    recoveryActions: []
  });

  // Create error context when error occurs
  const errorContext = createMemo(() => {
    const currentState = state();
    if (!currentState.error || !currentState.errorInfo) return null;
    
    return createErrorContext(currentState.error, currentState.errorInfo);
  });

  // Handle error occurrence
  const handleError = (error: Error, errorInfo: any) => {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // Create error context
    const context = createErrorContext(error, errorInfo);
    
    // Get applicable recovery strategies
    const strategies = getApplicableStrategies(
      error,
      context,
      props.recoveryStrategies
    );
    
    // Convert strategies to recovery actions
    const recoveryActions: RecoveryAction[] = strategies.map(strategy => ({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      action: strategy.id as any, // Type assertion for enum compatibility
      priority: strategy.priority,
      timeout: strategy.timeout
    }));

    // Update state
    setState({
      error,
      errorInfo,
      isRecovering: false,
      recoveryActions
    });

    // Report error if enabled
    if (props.reportErrors && props.errorReporting?.enabled) {
      const report = createErrorReport(error, context);
      reportError(report);
    }

    // Call user error handler
    props.onError?.(error, errorInfo);
  };

  // Retry the component
  const retry = () => {
    setState({
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryActions: []
    });
  };

  // Reset the component
  const reset = () => {
    setState({
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryActions: []
    });
    
    // Additional reset logic could go here
    // For example, clearing component state, localStorage, etc.
  };

  // Execute recovery action
  const executeRecovery = async (action: RecoveryAction) => {
    const currentState = state();
    if (!currentState.error || !errorContext()) return;

    setState(prev => ({ ...prev, isRecovering: true, lastRecoveryAttempt: Date.now() }));

    try {
      // Find the strategy for this action
      const strategy = props.recoveryStrategies?.find(s => s.id === action.id);
      if (!strategy) {
        throw new Error(`Recovery strategy not found: ${action.id}`);
      }

      // Execute the recovery strategy
      const result = await executeRecoveryStrategy(
        strategy,
        currentState.error,
        errorContext()!
      );

      if (result.success) {
        // Call user recovery handler
        props.onRecovery?.(action);
        
        // Retry the component
        retry();
      } else {
        console.error('Recovery failed:', result.error);
        // Could show error message to user
      }
    } catch (recoveryError) {
      console.error('Recovery execution failed:', recoveryError);
    } finally {
      setState(prev => ({ ...prev, isRecovering: false }));
    }
  };

  // Report error to external service
  const reportError = async (report: any) => {
    if (!props.errorReporting?.endpoint) return;

    try {
      const response = await fetch(props.errorReporting.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(props.errorReporting.apiKey && {
            'Authorization': `Bearer ${props.errorReporting.apiKey}`
          })
        },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        console.warn('Failed to report error:', response.statusText);
      }
    } catch (error) {
      console.warn('Error reporting failed:', error);
    }
  };

  // Global error handler
  const handleGlobalError = (event: ErrorEvent) => {
    if (props.isolate) {
      event.preventDefault();
      handleError(new Error(event.message), {
        componentStack: 'Global error',
        errorBoundary: 'global'
      });
    }
  };

  // Global unhandled rejection handler
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (props.isolate) {
      event.preventDefault();
      handleError(new Error(String(event.reason)), {
        componentStack: 'Unhandled promise rejection',
        errorBoundary: 'global'
      });
    }
  };

  // Set up global error handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    onCleanup(() => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    });
  }

  // Render error fallback or children
  return (
    <Show
      when={state().error}
      fallback={props.children}
    >
      <ErrorFallback
        error={state().error!}
        errorInfo={state().errorInfo!}
        retry={retry}
        reset={reset}
        recoveryActions={state().recoveryActions}
        isRecovering={state().isRecovering}
        onRecovery={executeRecovery}
        fallback={props.fallback}
      />
    </Show>
  );
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: Component<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryConfig>
) => {
  return (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
};
