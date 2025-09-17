/**
 * Multi-Modal Gallery Content Component
 *
 * Handles the main content area with different view modes.
 */
import { Component } from "solid-js";
import type { MultiModalFile, GalleryView } from "../types/MultiModalTypes";
interface MultiModalGalleryContentProps {
    files: MultiModalFile[];
    selectedFile: MultiModalFile | null;
    currentView: GalleryView;
    onFileSelect: (file: MultiModalFile) => void;
    onFileRemove: (fileId: string) => void;
    showMetadata?: boolean;
}
export declare const MultiModalGalleryContent: Component<MultiModalGalleryContentProps>;
export {};
