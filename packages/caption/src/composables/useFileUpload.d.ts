/**
 * File Upload Composable
 *
 * Handles file upload logic for the multi-modal gallery.
 */
import type { MultiModalFile } from "../types/MultiModalTypes";
export interface UseFileUploadReturn {
    isLoading: () => boolean;
    error: () => string | null;
    handleFileUpload: (event: Event, setFiles: (files: MultiModalFile[] | ((prev: MultiModalFile[]) => MultiModalFile[])) => void, maxFiles?: number) => Promise<void>;
}
export declare const useFileUpload: () => UseFileUploadReturn;
