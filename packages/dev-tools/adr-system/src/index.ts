/**
 * Reynard ADR System - Main Entry Point
 *
 * This package provides intelligent Architecture Decision Record (ADR) generation,
 * analysis, and management capabilities for the Reynard framework.
 */

export { CodebaseAnalyzer } from "./CodebaseAnalyzer";
export type {
  CodebaseMetrics,
  DependencyAnalysis,
  ArchitecturePattern,
  CodeQualityMetrics,
  ADRSuggestion,
} from "./CodebaseAnalyzer";

export { ADRGenerator } from "./ADRGenerator";
export { ADRValidator } from "./ADRValidator";
export { ADRRelationshipMapper } from "./ADRRelationshipMapper";

// Dashboard components
export { ComplianceDashboard } from "./ComplianceDashboard";
export { ComplianceDashboardDemo } from "./ComplianceDashboardDemo";
export { RealTimeArchitectureMonitor } from "./RealTimeArchitectureMonitor";
export { ComplianceScorer } from "./ComplianceScorer";
export { TeamPerformanceTracker } from "./TeamPerformanceTracker";

// Re-export types for convenience
export type { ADRDocument, ADRStatus, ADRCategory } from "./types";
