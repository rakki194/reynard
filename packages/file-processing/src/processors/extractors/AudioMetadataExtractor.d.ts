/**
 * Audio metadata extractor
 *
 * Handles metadata extraction for audio files including duration,
 * sample rate, channels, codec information, and format details.
 */
import { AudioMetadata } from "../../types";
import { BaseMetadataExtractor, MetadataExtractionOptions } from "./BaseMetadataExtractor";
export declare class AudioMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from audio files
     */
    extractMetadata(file: File | string, options?: Partial<MetadataExtractionOptions>): Promise<AudioMetadata>;
    /**
     * Load audio from file
     */
    private loadAudio;
    /**
     * Extract detailed audio information
     */
    private extractAudioInfo;
}
