/**
 * Reynard Annotating Core
 *
 * Core annotation system with backend integration.
 * This package provides the foundation for backend-based annotation capabilities.
 */
export { BackendAnnotationManager, createBackendAnnotationManager, } from "./services/BackendAnnotationManager.js";
export { BackendAnnotationService, createBackendAnnotationService, } from "./services/BackendAnnotationService.js";
export { AISharedBackendAnnotationService, type AISharedBackendAnnotationServiceConfig, } from "./services/AISharedBackendAnnotationService.js";
export { AnnotationServiceRegistry, getAnnotationServiceRegistry, resetAnnotationServiceRegistry, createDefaultAnnotationService, } from "./services/AnnotationServiceRegistry.js";
export { CaptionApiClient, createCaptionApiClient, createCaptionApiClientWithHealth, DEFAULT_CAPTION_CONFIG, } from "./clients/index.js";
export * from "./utils/index.js";
export * from "./types/index.js";
export type { CaptionTask, CaptionResult, CaptionGenerator, AnnotationProgress, CaptionGeneratorConfig, ModelManagerConfig, ModelUsageStats, HealthStatus, AnyAnnotationEvent, } from "./types/index.js";
