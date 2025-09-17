/**
 * Video Processing Composable for Reynard Caption System
 *
 * Handles video file processing, thumbnail generation, and metadata extraction.
 */
import { VideoFile } from "reynard-video";
import { Accessor } from "solid-js";
export interface UseVideoProcessingOptions {
    thumbnailSize?: [number, number];
    thumbnailFormat?: "webp" | "jpeg" | "png";
    thumbnailQuality?: number;
    maintainAspectRatio?: boolean;
    captureTime?: number;
}
export interface UseVideoProcessingReturn {
    isLoading: Accessor<boolean>;
    error: Accessor<string | null>;
    processVideoFile: (file: File) => Promise<VideoFile>;
    destroy: () => void;
}
export declare const useVideoProcessing: (options?: UseVideoProcessingOptions) => UseVideoProcessingReturn;
