/**
 * Barrel exports for the annotating package
 */
export { BackendAnnotationManager, createAnnotationManager } from "./BackendAnnotationManager";
export { DEFAULT_BACKEND_CONFIG } from "./config";
export type { BackendAnnotationManagerConfig } from "./config";
export { generateAnimeTags, generateDetailedCaption, generateFurryTags, generateGeneralCaption, } from "./caption-generators";
export { BatchCaptionProcessor } from "./components/BatchCaptionProcessor";
export type { BatchCaptionProcessorProps, BatchFile, BatchProgress as BatchProgressType, } from "./components/BatchCaptionProcessor";
export { BatchConfiguration } from "./components/BatchConfiguration";
export { BatchFileList } from "./components/BatchFileList";
export { BatchFileUpload } from "./components/BatchFileUpload";
export { BatchProgress } from "./components/BatchProgress";
export { BatchResults } from "./components/BatchResults";
