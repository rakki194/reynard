/**
 * Error Boundary Composable
 * Hook for managing error boundary state and actions
 */
import { ErrorContext } from "../types/ErrorTypes";
import { RecoveryAction, RecoveryStrategy } from "../types/RecoveryTypes";
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
export declare function useErrorBoundary(options?: UseErrorBoundaryOptions): UseErrorBoundaryReturn;
export {};
