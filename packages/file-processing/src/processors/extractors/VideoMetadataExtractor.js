/**
 * Video metadata extractor
 *
 * Handles metadata extraction for video files including dimensions,
 * duration, codec information, and frame data.
 */
import { BaseMetadataExtractor, } from "./BaseMetadataExtractor";
export class VideoMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from video files
     */
    async extractMetadata(file, options) {
        const mergedOptions = { ...this.options, ...options };
        const video = await this.loadVideo(file);
        const basicInfo = await this.getBasicFileInfo(file);
        const metadata = {
            ...basicInfo,
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            fps: 30, // Default assumption
            bitrate: 0, // Would need more complex analysis
            codec: "unknown", // Would need more complex analysis
            frameCount: Math.floor(video.duration * 30), // Estimate based on default FPS
        };
        // Try to extract more detailed video information if content analysis is enabled
        if (mergedOptions.analyzeContent) {
            try {
                const videoInfo = await this.extractVideoInfo();
                if (videoInfo) {
                    metadata.fps = videoInfo.fps || metadata.fps;
                    metadata.bitrate = videoInfo.bitrate || metadata.bitrate;
                    metadata.codec = videoInfo.codec || metadata.codec;
                    metadata.frameCount = videoInfo.frameCount || metadata.frameCount;
                    metadata.audioCodec = videoInfo.audioCodec;
                    metadata.audioBitrate = videoInfo.audioBitrate;
                }
            }
            catch (error) {
                console.warn("Detailed video info extraction failed:", error);
            }
        }
        return metadata;
    }
    /**
     * Load video from file
     */
    async loadVideo(file) {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
        if (typeof file === "string") {
            video.src = file;
        }
        else {
            video.src = URL.createObjectURL(file);
        }
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => resolve();
            video.onerror = () => reject(new Error("Failed to load video"));
        });
        return video;
    }
    /**
     * Extract detailed video information
     */
    async extractVideoInfo() {
        // This would require more complex video analysis
        // For now, return null
        return null;
    }
}
