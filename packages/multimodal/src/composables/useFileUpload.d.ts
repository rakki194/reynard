/**
 * File Upload Composable for Multi-Modal Gallery
 *
 * Provides file upload functionality with progress tracking and error handling.
 */
import type { MultiModalFile } from "../types";
export interface UseFileUploadReturn {
    isLoading: () => boolean;
    error: () => string | null;
    uploadProgress: () => Record<string, number>;
    handleFileUpload: (event: Event, setFiles: (files: MultiModalFile[]) => void, maxFiles?: number) => void;
}
export declare function useFileUpload(): UseFileUploadReturn;
