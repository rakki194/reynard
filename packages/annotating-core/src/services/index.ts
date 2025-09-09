/**
 * Services Barrel Export
 *
 * Exports for backend annotation services.
 */

// Backend services
export {
  BackendAnnotationService,
  createBackendAnnotationService,
} from "./BackendAnnotationService.js";
export {
  BackendAnnotationManager,
  createBackendAnnotationManager,
} from "./BackendAnnotationManager.js";

// Supporting modules
export { SimpleEventManager } from "./EventManager.js";
export { GeneratorConverter } from "./GeneratorConverter.js";
export { BatchProcessor } from "./BatchProcessor.js";
export { SingleCaptionProcessor } from "./SingleCaptionProcessor.js";
export { GeneratorManager } from "./GeneratorManager.js";
export { HealthStatsManager } from "./HealthStatsManager.js";
