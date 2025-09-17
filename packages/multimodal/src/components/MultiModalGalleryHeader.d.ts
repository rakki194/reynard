/**
 * Multi-Modal Gallery Header Component
 *
 * Handles gallery title, file counts, view controls, and file upload.
 */
import { Component } from "solid-js";
import type { MediaType, GalleryView, FileCounts } from "../types/MultiModalTypes";
interface MultiModalGalleryHeaderProps {
    fileCounts: FileCounts;
    filterType: MediaType | "all";
    onFilterChange: (type: MediaType | "all") => void;
    currentView: GalleryView;
    onViewChange: (view: GalleryView) => void;
    onFileUpload: (event: Event) => void;
    isLoading: boolean;
}
export declare const MultiModalGalleryHeader: Component<MultiModalGalleryHeaderProps>;
export {};
