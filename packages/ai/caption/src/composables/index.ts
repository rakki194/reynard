/**
 * Barrel exports for Multi-Modal Gallery Composables
 *
 * Provides clean API boundaries for all multi-modal gallery composables.
 */

export { useFileProcessing } from "./useFileProcessing";
export type { UseFileProcessingReturn } from "./useFileProcessing";

export { useFileHandling } from "./useFileHandling";
export type { UseFileHandlingReturn } from "./useFileHandling";
export { useFileUpload } from "./useFileUpload";
export type { UseFileUploadReturn } from "./useFileUpload";

// Caption Generator Composables
export { useCaptionGeneratorState } from "./useCaptionGeneratorState";
export type { CaptionGeneratorState, GeneratorInfo } from "./useCaptionGeneratorState";

export { useCaptionGeneratorHandlers } from "./useCaptionGeneratorHandlers";
export type { CaptionGeneratorHandlers } from "./useCaptionGeneratorHandlers";

export { useCaptionGeneratorBackend } from "./useCaptionGeneratorBackend";
export type { CaptionGeneratorBackend } from "./useCaptionGeneratorBackend";

// Text File Management Composables
export { useTextFileManager } from "./useTextFileManager";
export type { UseTextFileManagerOptions } from "./useTextFileManager";

export { useTextFileUpload } from "./useTextFileUpload";
export type { UseTextFileUploadOptions } from "./useTextFileUpload";
