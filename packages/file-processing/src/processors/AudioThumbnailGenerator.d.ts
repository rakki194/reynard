/**
 * Audio Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for audio files
 * including MP3, WAV, OGG, and other audio formats with waveform visualization.
 */
import { ThumbnailOptions, ProcessingResult } from "../types";
export interface AudioThumbnailGeneratorOptions extends ThumbnailOptions {
    /** Whether to enable Web Workers for background processing */
    useWebWorkers?: boolean;
    /** Maximum thumbnail size in bytes */
    maxThumbnailSize?: number;
    /** Whether to enable progressive loading */
    progressive?: boolean;
    /** Custom background color for audio thumbnails */
    backgroundColor?: string;
    /** Number of waveform bars to display */
    waveformBars?: number;
}
export declare class AudioThumbnailGenerator {
    private options;
    private audioAnalyzer;
    private waveformRenderer;
    private canvasUtils;
    constructor(options?: AudioThumbnailGeneratorOptions);
    /**
     * Generate thumbnail for audio files
     */
    generateThumbnail(file: File | string, options?: Partial<ThumbnailOptions>): Promise<ProcessingResult<Blob>>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
