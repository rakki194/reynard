/**
 * Image Grid Component for Reynard Caption System
 *
 * Leverages existing GalleryGrid infrastructure and ImageThumbnailGenerator
 * for comprehensive image file handling and display.
 */
import { Component } from "solid-js";
import { ImageFile } from "./types/ImageTypes";
export interface ImageGridProps {
    /** Initial image files to display */
    initialFiles?: ImageFile[];
    /** Callback when files are selected */
    onFileSelect?: (file: ImageFile) => void;
    /** Callback when files are removed */
    onFileRemove?: (fileId: string) => void;
    /** Callback when caption generation is requested */
    onGenerateCaption?: (file: ImageFile) => void;
    /** Maximum number of files to display */
    maxFiles?: number;
    /** Whether to show file metadata */
    showMetadata?: boolean;
    /** Whether caption generation is in progress */
    isGenerating?: boolean;
    /** Custom CSS class */
    class?: string;
}
export declare const ImageGrid: Component<ImageGridProps>;
