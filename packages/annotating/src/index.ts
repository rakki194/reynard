/**
 * Reynard Annotating - Unified Annotation System
 *
 * This package provides a unified interface for all Reynard caption generators
 * with production features including usage tracking, health monitoring, and
 * comprehensive model management.
 */

// Main exports (Backend service - recommended)
export {
  BackendAnnotationManager,
  createAnnotationManager as createBackendAnnotationManager,
  DEFAULT_BACKEND_CONFIG,
} from "./BackendAnnotationManager.js";

// Re-export core functionality
export {
  BackendAnnotationManager as CoreBackendManager,
  BackendAnnotationService as CoreBackendService,
  createBackendAnnotationManager as createCoreBackendManager,
  createBackendAnnotationService as createCoreBackendService,
  CaptionApiClient,
  createCaptionApiClient,
  createCaptionApiClientWithHealth,
  DEFAULT_CAPTION_CONFIG,
} from "reynard-annotating-core";

// Re-export generator configurations for advanced usage
export * from "reynard-annotating-jtp2";
export * from "reynard-annotating-joy";
export * from "reynard-annotating-florence2";
export * from "reynard-annotating-wdv3";

// Re-export types for convenience
export type {
  CaptionTask,
  CaptionResult,
  CaptionGenerator,
  AnnotationProgress,
  CaptionGeneratorConfig,
  ModelManagerConfig,
  ModelUsageStats,
  HealthStatus,
  AnyAnnotationEvent,
  CaptionType,
  ModelCategory,
  ModelStatus,
  OperationStatus,
  ErrorType,
} from "reynard-annotating-core";
