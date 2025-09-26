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

// Dashboard components (JSX components temporarily excluded)
// export { ComplianceDashboard } from "./ComplianceDashboard";
// export { ComplianceDashboardDemo } from "./ComplianceDashboardDemo";
// export { RealTimeArchitectureMonitor } from "./RealTimeArchitectureMonitor";
// export { ComplianceScorer } from "./ComplianceScorer";
// export { TeamPerformanceTracker } from "./TeamPerformanceTracker";

// Visualization components (JSX components temporarily excluded)
// export { DependencyGraphGenerator } from "./DependencyGraphGenerator";
// export { InteractiveDiagramSystem, InteractiveDiagramSystemDemo } from "./InteractiveDiagramSystem";
// export { ArchitectureMappingTools } from "./ArchitectureMappingTools";
// export { Architecture3DViewer, Architecture3DViewerDemo } from "./Architecture3DViewer";
// export { CollaborativeEditingInterface, CollaborativeEditingInterfaceDemo } from "./CollaborativeEditingInterface";

// AI-Powered Architecture Analysis components (temporarily excluded)
// export { AIPatternRecognition } from "./AIPatternRecognition";
// export { AnomalyDetectionSystem } from "./AnomalyDetectionSystem";
// export { OptimizationSuggestionEngine } from "./OptimizationSuggestionEngine";
// export { ImpactPredictionModels } from "./ImpactPredictionModels";
// export { ArchitecturalHealthScoring } from "./ArchitecturalHealthScoring";

// TESLA Architecture Analysis System
export { TeslaArchitectureScanner } from "./TeslaArchitectureScanner";
export { TeslaPatternExtractor } from "./TeslaPatternExtractor";
export { TeslaPointCalculator } from "./TeslaPointCalculator";
export { TeslaAutonomyAnalyzer } from "./TeslaAutonomyAnalyzer";

// Re-export types for convenience
export type { ADRDocument, ADRStatus, ADRCategory } from "./types";
export type {
  SemanticArchitecturePattern,
  TeslaArchitectureAnalysis,
  TeslaAutonomyLevel,
  TeslaSystemCategory,
} from "./TeslaTypes";
export type { PatternExtractionConfig } from "./TeslaPatternExtractor";
export type { PointCalculationConfig } from "./TeslaPointCalculator";
export type { AutonomyAnalysisConfig } from "./TeslaAutonomyAnalyzer";
export type { TeslaScannerConfig } from "./TeslaArchitectureScanner";

// export type { DependencyGraph, DependencyNode, DependencyEdge } from "./DependencyGraphGenerator";
// export type { ArchitectureMap, ArchitectureComponent, ArchitectureRelationship } from "./ArchitectureMappingTools";
// export type { CollaborativeSession, CollaborativeUser, CollaborativeComment } from "./CollaborativeEditingInterface";
// export type { DetectedPattern, PatternRecognitionModel } from "./AIPatternRecognition";
// export type { ArchitecturalAnomaly } from "./AnomalyDetectionSystem";
// export type { OptimizationSuggestion } from "./OptimizationSuggestionEngine";
// export type { ImpactPrediction } from "./ImpactPredictionModels";
// export type { ArchitecturalHealthScore } from "./ArchitecturalHealthScoring";
