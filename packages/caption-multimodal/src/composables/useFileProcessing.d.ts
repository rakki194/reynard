/**
 * File Processing Composable
 *
 * Handles file upload and processing logic for the multi-modal gallery.
 */
import type { MultiModalFile } from "reynard-caption-core";
import { createFileProcessingPipeline } from "reynard-caption-core";
export interface UseFileProcessingReturn {
    isLoading: () => boolean;
    error: () => string | null;
    processFileWrapper: (file: File) => Promise<MultiModalFile>;
    processingPipeline: ReturnType<typeof createFileProcessingPipeline>;
}
export declare const useFileProcessing: () => UseFileProcessingReturn;
