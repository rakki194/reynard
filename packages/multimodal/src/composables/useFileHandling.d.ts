/**
 * File Handling Composable for Multi-Modal Gallery
 *
 * Provides state management and utilities for handling files in the gallery.
 */
import type { MultiModalFile, GalleryView, MediaType } from "../types";
export interface UseFileHandlingReturn {
    files: () => MultiModalFile[];
    setFiles: (files: MultiModalFile[]) => void;
    selectedFile: () => MultiModalFile | null;
    setSelectedFile: (file: MultiModalFile | null) => void;
    currentView: () => GalleryView;
    setCurrentView: (view: GalleryView) => void;
    filterType: () => MediaType | "all";
    setFilterType: (type: MediaType | "all") => void;
    filteredFiles: () => MultiModalFile[];
    fileCounts: () => Record<MediaType, number>;
    handleFileSelect: (file: MultiModalFile) => void;
    handleFileRemove: (file: MultiModalFile) => void;
    handleFileModify: (file: MultiModalFile) => void;
}
export declare function useFileHandling(initialFiles?: MultiModalFile[], defaultView?: GalleryView, onFileSelect?: (file: MultiModalFile) => void, onFileRemove?: (file: MultiModalFile) => void, onFileModify?: (file: MultiModalFile) => void): UseFileHandlingReturn;
