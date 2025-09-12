/**
 * Barrel exports for Multi-Modal Gallery Composables
 *
 * Provides clean API boundaries for all multi-modal gallery composables.
 */

export { useFileProcessing } from "./useFileProcessing";
export type { UseFileProcessingReturn } from "./useFileProcessing";

export { useVideoProcessing } from "./useVideoProcessing";
export type {
  UseVideoProcessingReturn,
  UseVideoProcessingOptions,
} from "./useVideoProcessing";
export { useFileHandling } from "./useFileHandling";
export type { UseFileHandlingReturn } from "./useFileHandling";
export { useFileUpload } from "./useFileUpload";
export type { UseFileUploadReturn } from "./useFileUpload";
