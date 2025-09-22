/**
 * Error Types and Classification System
 * Comprehensive error type definitions for the Reynard error boundary system
 */

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  RENDERING = "rendering",
  NETWORK = "network",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  PERMISSION = "permission",
  RESOURCE = "resource",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
  [key: string]: unknown;
}

export interface ErrorContext {
  componentStack: string[];
  errorBoundaryId: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  metadata: Record<string, unknown>;
  errorBoundaryStack?: string;
}

export interface ErrorReport {
  id: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: ErrorContext;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  userReport?: string;
}

export interface ErrorBoundaryConfig {
  isolate?: boolean;
  reportErrors?: boolean;
  errorReporting?: ErrorReportingConfig;
  recoveryStrategies?: RecoveryStrategy[];
  fallback?: Component<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: (recoveryAction: RecoveryAction) => void;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  includeStackTrace?: boolean;
  includeUserContext?: boolean;
  filters?: ErrorFilter[];
}

export interface ErrorFilter {
  type: "severity" | "category" | "message" | "component";
  value: unknown;
  action: "include" | "exclude";
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
  reset: () => void;
  recoveryActions: RecoveryAction[];
  isRecovering: boolean;
  onRecovery?: (action: RecoveryAction) => void;
  fallback?: Component<ErrorFallbackProps>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  recoveryRate: number;
  averageRecoveryTime: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  topErrors: Array<{ error: string; count: number }>;
  errorRateTrend: "up" | "down" | "stable";
  recoveryRateTrend: "up" | "down" | "stable";
}

// Re-export Component type from SolidJS
import type { Component } from "solid-js";
import type { RecoveryStrategy, RecoveryAction } from "./RecoveryTypes";

export type { Component, RecoveryAction };
