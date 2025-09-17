/**
 * Video metadata extractor
 *
 * Handles metadata extraction for video files including dimensions,
 * duration, codec information, and frame data.
 */
import { VideoMetadata } from "../../types";
import { BaseMetadataExtractor, MetadataExtractionOptions } from "./BaseMetadataExtractor";
export declare class VideoMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from video files
     */
    extractMetadata(file: File | string, options?: Partial<MetadataExtractionOptions>): Promise<VideoMetadata>;
    /**
     * Load video from file
     */
    private loadVideo;
    /**
     * Extract detailed video information
     */
    private extractVideoInfo;
}
