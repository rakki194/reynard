/**
 * Built-in Recovery Strategies
 * Comprehensive recovery strategies for different error types
 */

import {
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
} from "../types/ErrorTypes";
import {
  RecoveryStrategy,
  RecoveryResult,
  RecoveryActionType,
} from "../types/RecoveryTypes";

/**
 * Retry strategy for network and resource errors
 */
export const retryStrategy: RecoveryStrategy = {
  id: "retry",
  name: "Retry Operation",
  description: "Attempt to retry the failed operation",
  canRecover: (_error, context) =>
    context.category === ErrorCategory.NETWORK ||
    context.category === ErrorCategory.RESOURCE ||
    context.category === ErrorCategory.TIMEOUT,
  recover: async (_error, _context) => {
    // Simulate retry logic - in real implementation, this would
    // trigger a retry of the original operation
    return {
      success: true,
      action: RecoveryActionType.RETRY,
      message: "Operation retried successfully",
    };
  },
  priority: 1,
  timeout: 5000,
};

/**
 * Fallback UI strategy for rendering errors
 */
export const fallbackUIStrategy: RecoveryStrategy = {
  id: "fallback-ui",
  name: "Show Fallback UI",
  description: "Display a simplified version of the component",
  canRecover: (_error, context) => context.category === ErrorCategory.RENDERING,
  recover: async (_error, _context) => {
    return {
      success: true,
      action: RecoveryActionType.FALLBACK,
      message: "Fallback UI displayed",
    };
  },
  priority: 2,
};

/**
 * Reset strategy for component state errors
 */
export const resetStrategy: RecoveryStrategy = {
  id: "reset",
  name: "Reset Component",
  description: "Reset the component to its initial state",
  canRecover: (_error, context) =>
    context.category === ErrorCategory.RENDERING ||
    context.category === ErrorCategory.VALIDATION,
  recover: async (_error, _context) => {
    return {
      success: true,
      action: RecoveryActionType.RESET,
      message: "Component reset successfully",
    };
  },
  priority: 3,
};

/**
 * Redirect strategy for critical errors
 */
export const redirectStrategy: RecoveryStrategy = {
  id: "redirect",
  name: "Redirect to Safe Page",
  description: "Navigate to a safe page",
  canRecover: (_error, context) =>
    context.severity === ErrorSeverity.CRITICAL ||
    context.category === ErrorCategory.AUTHENTICATION ||
    context.category === ErrorCategory.PERMISSION,
  recover: async (_error, _context) => {
    // In a real implementation, this would use a router
    if (typeof window !== "undefined") {
      window.location.href = "/error";
    }
    return {
      success: true,
      action: RecoveryActionType.REDIRECT,
      message: "Redirected to safe page",
    };
  },
  priority: 4,
};

/**
 * Reload strategy for critical application errors
 */
export const reloadStrategy: RecoveryStrategy = {
  id: "reload",
  name: "Reload Application",
  description: "Reload the entire application",
  canRecover: (_error, context) => context.severity === ErrorSeverity.CRITICAL,
  recover: async (_error, _context) => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
    return {
      success: true,
      action: RecoveryActionType.RELOAD,
      message: "Application reloaded",
    };
  },
  priority: 5,
};

/**
 * Custom strategy for specific error handling
 */
export const customStrategy: RecoveryStrategy = {
  id: "custom",
  name: "Custom Recovery",
  description: "Execute custom recovery logic",
  canRecover: (_error, _context) => true, // Always available as fallback
  recover: async (_error, _context) => {
    return {
      success: false,
      action: RecoveryActionType.CUSTOM,
      message: "Custom recovery not implemented",
      error: new Error("Custom recovery strategy requires implementation"),
    };
  },
  priority: 10,
};

/**
 * All built-in recovery strategies
 */
export const builtInRecoveryStrategies: RecoveryStrategy[] = [
  retryStrategy,
  fallbackUIStrategy,
  resetStrategy,
  redirectStrategy,
  reloadStrategy,
  customStrategy,
];

/**
 * Get applicable recovery strategies for an error
 */
export function getApplicableStrategies(
  error: Error,
  context: ErrorContext,
  strategies: RecoveryStrategy[] = builtInRecoveryStrategies,
): RecoveryStrategy[] {
  return strategies
    .filter((strategy) => strategy.canRecover(error, context))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Execute a recovery strategy
 */
export async function executeRecoveryStrategy(
  strategy: RecoveryStrategy,
  error: Error,
  context: ErrorContext,
): Promise<RecoveryResult> {
  try {
    const result = await Promise.race([
      strategy.recover(error, context),
      new Promise<RecoveryResult>((_, reject) =>
        setTimeout(
          () => reject(new Error("Recovery timeout")),
          strategy.timeout || 10000,
        ),
      ),
    ]);
    return result;
  } catch (recoveryError) {
    return {
      success: false,
      action: RecoveryActionType.CUSTOM,
      message: "Recovery strategy failed",
      error:
        recoveryError instanceof Error
          ? recoveryError
          : new Error(String(recoveryError)),
    };
  }
}

/**
 * Create custom recovery strategy
 */
export function createRecoveryStrategy(
  id: string,
  name: string,
  description: string,
  canRecover: (error: Error, context: ErrorContext) => boolean,
  recover: (error: Error, context: ErrorContext) => Promise<RecoveryResult>,
  priority: number = 5,
  timeout?: number,
): RecoveryStrategy {
  return {
    id,
    name,
    description,
    canRecover,
    recover,
    priority,
    timeout,
  };
}
