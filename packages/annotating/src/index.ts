/**
 * Barrel exports for the annotating package
 */

// Main manager class and factory
export { BackendAnnotationManager, createAnnotationManager } from "./BackendAnnotationManager";

// Configuration types and constants
export { DEFAULT_BACKEND_CONFIG } from "./config";
export type { BackendAnnotationManagerConfig } from "./config";

// Caption generation utilities
export {
  generateAnimeTags,
  generateDetailedCaption,
  generateFurryTags,
  generateGeneralCaption,
} from "./caption-generators";

// Batch processing components
export { BatchCaptionProcessor } from "./components/BatchCaptionProcessor";
export type {
  BatchCaptionProcessorProps,
  BatchFile,
  BatchProgress as BatchProgressType,
} from "./components/BatchCaptionProcessor";
export { BatchConfiguration } from "./components/BatchConfiguration";
export { BatchFileList } from "./components/BatchFileList";
export { BatchFileUpload } from "./components/BatchFileUpload";
export { BatchProgress } from "./components/BatchProgress";
export { BatchResults } from "./components/BatchResults";
