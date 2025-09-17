/**
 * Video Grid Content Component for Reynard Caption System
 *
 * Renders the main content area of the video grid.
 */
import { Component } from "solid-js";
import { VideoFile } from "../types";
export interface VideoGridContentProps {
    class?: string;
    videoFiles: () => VideoFile[];
    selectedFile: () => VideoFile | null;
    isLoading: () => boolean;
    error: () => string | null;
    showMetadata?: boolean;
    onFileUpload: (event: Event) => void;
    onFileSelect: (file: VideoFile) => void;
    onFileRemove: (fileId: string) => void;
    onClosePlayer: () => void;
}
export declare const VideoGridContent: Component<VideoGridContentProps>;
