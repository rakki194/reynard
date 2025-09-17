/**
 * Audio metadata extractor
 *
 * Handles metadata extraction for audio files including duration,
 * sample rate, channels, codec information, and format details.
 */
import { BaseMetadataExtractor, } from "./BaseMetadataExtractor";
export class AudioMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from audio files
     */
    async extractMetadata(file, options) {
        const audio = await this.loadAudio(file);
        const basicInfo = await this.getBasicFileInfo(file);
        // Merge options with instance options
        const mergedOptions = { ...this.options, ...options };
        const metadata = {
            ...basicInfo,
            duration: audio.duration,
            sampleRate: 44100, // Default assumption
            channels: 2, // Default assumption
            bitrate: 0, // Would need more complex analysis
            codec: "unknown", // Would need more complex analysis
            format: this.getFileExtension(basicInfo.name).substring(1).toUpperCase(),
        };
        // Try to extract more detailed audio information if content analysis is enabled
        if (mergedOptions.analyzeContent) {
            try {
                const audioInfo = await this.extractAudioInfo();
                if (audioInfo) {
                    metadata.sampleRate = audioInfo.sampleRate || metadata.sampleRate;
                    metadata.channels = audioInfo.channels || metadata.channels;
                    metadata.bitrate = audioInfo.bitrate || metadata.bitrate;
                    metadata.codec = audioInfo.codec || metadata.codec;
                }
            }
            catch (error) {
                console.warn("Detailed audio info extraction failed:", error);
            }
        }
        return metadata;
    }
    /**
     * Load audio from file
     */
    async loadAudio(file) {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        if (typeof file === "string") {
            audio.src = file;
        }
        else {
            audio.src = URL.createObjectURL(file);
        }
        await new Promise((resolve, reject) => {
            audio.onloadedmetadata = () => resolve();
            audio.onerror = () => reject(new Error("Failed to load audio"));
        });
        return audio;
    }
    /**
     * Extract detailed audio information
     */
    async extractAudioInfo() {
        // This would require more complex audio analysis
        // For now, return null
        return null;
    }
}
