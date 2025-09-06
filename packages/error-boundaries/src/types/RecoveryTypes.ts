/**
 * Recovery Types and Strategy System
 * Comprehensive recovery strategy definitions for error handling
 */

import type { ErrorContext } from './ErrorTypes';

export enum RecoveryActionType {
  RETRY = 'retry',
  RESET = 'reset',
  FALLBACK = 'fallback',
  REDIRECT = 'redirect',
  RELOAD = 'reload',
  CUSTOM = 'custom'
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  canRecover: (error: Error, context: ErrorContext) => boolean;
  recover: (error: Error, context: ErrorContext) => Promise<RecoveryResult>;
  priority: number;
  timeout?: number;
}

export interface RecoveryResult {
  success: boolean;
  action: RecoveryActionType;
  message?: string;
  data?: unknown;
  error?: Error;
}

export interface RecoveryAction {
  id: string;
  name: string;
  description: string;
  action: RecoveryActionType;
  priority: number;
  timeout?: number;
  data?: unknown;
}

export interface RecoveryContext {
  error: Error;
  errorContext: ErrorContext;
  attempts: number;
  maxAttempts: number;
  startTime: number;
  timeout?: number;
}

export interface RecoveryOptions {
  maxAttempts?: number;
  timeout?: number;
  backoffMultiplier?: number;
  baseDelay?: number;
  onAttempt?: (attempt: number, error: Error) => void;
  onSuccess?: (result: RecoveryResult) => void;
  onFailure?: (error: Error) => void;
}

export interface RecoveryState {
  isRecovering: boolean;
  currentStrategy?: RecoveryStrategy;
  attempts: number;
  lastAttempt?: number;
  lastResult?: RecoveryResult;
  error?: Error;
}
