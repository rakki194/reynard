/**
 * Reynard Annotating Core
 *
 * Core annotation system with backend integration.
 * This package provides the foundation for backend-based annotation capabilities.
 */

// Backend services
export {
  BackendAnnotationManager,
  createBackendAnnotationManager,
} from "./services/BackendAnnotationManager.js";
export {
  BackendAnnotationService,
  createBackendAnnotationService,
} from "./services/BackendAnnotationService.js";
export {
  AISharedBackendAnnotationService,
  type AISharedBackendAnnotationServiceConfig,
} from "./services/AISharedBackendAnnotationService.js";
export {
  AnnotationServiceRegistry,
  getAnnotationServiceRegistry,
  resetAnnotationServiceRegistry,
  createDefaultAnnotationService,
} from "./services/AnnotationServiceRegistry.js";

// API clients
export {
  CaptionApiClient,
  createCaptionApiClient,
  createCaptionApiClientWithHealth,
  DEFAULT_CAPTION_CONFIG,
} from "./clients/index.js";

// Utilities
export * from "./utils/index.js";

// Type exports
export * from "./types/index.js";

// Re-export commonly used types for convenience
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
} from "./types/index.js";
