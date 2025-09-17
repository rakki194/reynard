/**
 * Audio Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for audio files
 * including MP3, WAV, OGG, and other audio formats with waveform visualization.
 */
import { AudioAnalyzer, WaveformRenderer, CanvasUtils } from "./audio";
export class AudioThumbnailGenerator {
    constructor(options = { size: [200, 200] }) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "audioAnalyzer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "waveformRenderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "canvasUtils", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = {
            format: "webp",
            quality: 85,
            maintainAspectRatio: true,
            backgroundColor: "#1db954", // Spotify green
            enableAnimation: true,
            animationSlowdown: 2.0,
            useWebWorkers: false,
            maxThumbnailSize: 1024 * 1024, // 1MB
            progressive: true,
            waveformBars: 20,
            ...options,
        };
        this.audioAnalyzer = new AudioAnalyzer();
        this.waveformRenderer = new WaveformRenderer();
        this.canvasUtils = new CanvasUtils();
    }
    /**
     * Generate thumbnail for audio files
     */
    async generateThumbnail(file, options) {
        const startTime = Date.now();
        const mergedOptions = { ...this.options, ...options };
        try {
            const audio = await this.audioAnalyzer.loadAudio(file);
            const canvas = this.canvasUtils.getCanvas();
            const [targetWidth, targetHeight] = mergedOptions.size;
            // Set up canvas with background
            const ctx = this.canvasUtils.setupCanvas(canvas, targetWidth, targetHeight, mergedOptions.backgroundColor || "#1db954");
            // Analyze audio data
            let audioData = null;
            try {
                audioData = await this.audioAnalyzer.analyzeAudioData(audio);
            }
            catch (error) {
                // Continue with fallback waveform
                audioData = null;
            }
            // Draw audio waveform visualization
            await this.waveformRenderer.drawAudioWaveform(ctx, targetWidth, targetHeight, audioData, audio, mergedOptions);
            // Add small audio icon in corner
            this.canvasUtils.drawAudioIcon(ctx, targetWidth, targetHeight, true);
            // Convert to blob
            const blob = await this.canvasUtils.canvasToBlob(canvas, mergedOptions);
            return {
                success: true,
                data: blob,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Failed to generate audio thumbnail",
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.audioAnalyzer.destroy();
        this.canvasUtils.destroy();
    }
}
