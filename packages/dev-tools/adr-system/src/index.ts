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

// Visualization components
export { DependencyGraphGenerator } from "./DependencyGraphGenerator";
export { InteractiveDiagramSystem, InteractiveDiagramSystemDemo } from "./InteractiveDiagramSystem";
export { ArchitectureMappingTools } from "./ArchitectureMappingTools";
export { Architecture3DViewer, Architecture3DViewerDemo } from "./Architecture3DViewer";
export { CollaborativeEditingInterface, CollaborativeEditingInterfaceDemo } from "./CollaborativeEditingInterface";

// Re-export types for convenience
export type { ADRDocument, ADRStatus, ADRCategory } from "./types";
export type { DependencyGraph, DependencyNode, DependencyEdge } from "./DependencyGraphGenerator";
export type { ArchitectureMap, ArchitectureComponent, ArchitectureRelationship } from "./ArchitectureMappingTools";
export type { CollaborativeSession, CollaborativeUser, CollaborativeComment } from "./CollaborativeEditingInterface";
