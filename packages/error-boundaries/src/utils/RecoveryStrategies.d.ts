/**
 * Built-in Recovery Strategies
 * Comprehensive recovery strategies for different error types
 */
import { ErrorContext } from "../types/ErrorTypes";
import { RecoveryStrategy, RecoveryResult } from "../types/RecoveryTypes";
/**
 * Retry strategy for network and resource errors
 */
export declare const retryStrategy: RecoveryStrategy;
/**
 * Fallback UI strategy for rendering errors
 */
export declare const fallbackUIStrategy: RecoveryStrategy;
/**
 * Reset strategy for component state errors
 */
export declare const resetStrategy: RecoveryStrategy;
/**
 * Redirect strategy for critical errors
 */
export declare const redirectStrategy: RecoveryStrategy;
/**
 * Reload strategy for critical application errors
 */
export declare const reloadStrategy: RecoveryStrategy;
/**
 * Custom strategy for specific error handling
 */
export declare const customStrategy: RecoveryStrategy;
/**
 * All built-in recovery strategies
 */
export declare const builtInRecoveryStrategies: RecoveryStrategy[];
/**
 * Get applicable recovery strategies for an error
 */
export declare function getApplicableStrategies(error: Error, context: ErrorContext, strategies?: RecoveryStrategy[]): RecoveryStrategy[];
/**
 * Execute a recovery strategy
 */
export declare function executeRecoveryStrategy(strategy: RecoveryStrategy, error: Error, context: ErrorContext): Promise<RecoveryResult>;
/**
 * Create custom recovery strategy
 */
export declare function createRecoveryStrategy(id: string, name: string, description: string, canRecover: (error: Error, context: ErrorContext) => boolean, recover: (error: Error, context: ErrorContext) => Promise<RecoveryResult>, priority?: number, timeout?: number): RecoveryStrategy;
