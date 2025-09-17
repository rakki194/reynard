/**
 * Video Loading and Caching Module for Video Thumbnail Generation.
 *
 * Handles video file loading, caching, and metadata extraction.
 */
export interface VideoLoadResult {
    video: HTMLVideoElement;
    duration: number;
    width: number;
    height: number;
}
export declare class VideoLoader {
    private videoCache;
    /**
     * Load video file with caching
     */
    loadVideo(file: File | string): Promise<VideoLoadResult>;
    /**
     * Create and configure video element
     */
    private createVideoElement;
    /**
     * Load video metadata
     */
    private loadVideoMetadata;
    /**
     * Wait for video to seek to the specified time
     */
    waitForVideoSeek(video: HTMLVideoElement): Promise<void>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
