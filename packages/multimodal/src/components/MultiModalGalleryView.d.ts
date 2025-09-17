/**
 * Multi-Modal Gallery View Component
 *
 * Handles the JSX rendering for the multi-modal gallery.
 */
import { Component } from "solid-js";
import type { MultiModalFile, MediaType, GalleryView, FileCounts } from "../types";
interface MultiModalGalleryViewProps {
    class?: string;
    fileCounts: FileCounts;
    filterType: MediaType | "all";
    onFilterChange: (type: MediaType | "all") => void;
    currentView: GalleryView;
    onViewChange: (view: GalleryView) => void;
    onFileUpload: (event: Event) => void;
    isLoading: boolean;
    error: string | null;
    filteredFiles: MultiModalFile[];
    selectedFile: MultiModalFile | null;
    onFileSelect: (file: MultiModalFile) => void;
    onFileRemove: (file: MultiModalFile) => void;
    onFileModify: (file: MultiModalFile) => void;
    onCloseDetail: () => void;
    showMetadata?: boolean;
    editable?: boolean;
}
export declare const MultiModalGalleryView: Component<MultiModalGalleryViewProps>;
export {};
