/**
 * File Handling Composable
 *
 * Handles file state management and operations for the multi-modal gallery.
 */
import type { GalleryView, MediaType, MultiModalFile } from "reynard-caption-core";
import { calculateFileCounts } from "reynard-caption-core";
export interface UseFileHandlingReturn {
    files: () => MultiModalFile[];
    setFiles: (files: MultiModalFile[] | ((prev: MultiModalFile[]) => MultiModalFile[])) => void;
    selectedFile: () => MultiModalFile | null;
    setSelectedFile: (file: MultiModalFile | null) => void;
    currentView: () => GalleryView;
    setCurrentView: (view: GalleryView) => void;
    filterType: () => MediaType | "all";
    setFilterType: (type: MediaType | "all") => void;
    filteredFiles: () => MultiModalFile[];
    fileCounts: () => ReturnType<typeof calculateFileCounts>;
    handleFileSelect: (file: MultiModalFile) => void;
    handleFileRemove: (fileId: string) => void;
    handleFileModify: (fileId: string, content: unknown) => void;
}
export declare const useFileHandling: (initialFiles?: MultiModalFile[], defaultView?: GalleryView, onFileSelect?: (file: MultiModalFile) => void, onFileRemove?: (fileId: string) => void, onFileModify?: (fileId: string, content: unknown) => void) => UseFileHandlingReturn;
