/**
 * Barrel exports for the annotating package
 */

// Main manager class and factory
export {
  BackendAnnotationManager,
  createAnnotationManager,
} from "./BackendAnnotationManager";

// Configuration types and constants
export type { BackendAnnotationManagerConfig } from "./config";
export { DEFAULT_BACKEND_CONFIG } from "./config";

// Caption generation utilities
export {
  generateFurryTags,
  generateDetailedCaption,
  generateAnimeTags,
  generateGeneralCaption,
} from "./caption-generators";

// Batch processing components
export { BatchCaptionProcessor } from "./components/BatchCaptionProcessor";
export { BatchFileUpload } from "./components/BatchFileUpload";
export { BatchConfiguration } from "./components/BatchConfiguration";
export { BatchProgress } from "./components/BatchProgress";
export { BatchFileList } from "./components/BatchFileList";
export { BatchResults } from "./components/BatchResults";
export type {
  BatchCaptionProcessorProps,
  BatchFile,
  BatchProgress,
} from "./components/BatchCaptionProcessor";
