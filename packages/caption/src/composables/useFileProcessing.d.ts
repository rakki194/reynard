/**
 * File Processing Composable
 *
 * Handles file upload and processing logic for the multi-modal gallery.
 */
import type { MultiModalFile } from "../types/MultiModalTypes";
import { createFileProcessingPipeline } from "../utils/FileProcessingUtils";
export interface UseFileProcessingReturn {
    isLoading: () => boolean;
    error: () => string | null;
    processFileWrapper: (file: File) => Promise<MultiModalFile>;
    processingPipeline: ReturnType<typeof createFileProcessingPipeline>;
}
export declare const useFileProcessing: () => UseFileProcessingReturn;
