/**
 * Video Loading and Caching Module for Video Thumbnail Generation.
 *
 * Handles video file loading, caching, and metadata extraction.
 */
export class VideoLoader {
    constructor() {
        Object.defineProperty(this, "videoCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Load video file with caching
     */
    async loadVideo(file) {
        const key = typeof file === "string" ? file : file.name;
        if (this.videoCache.has(key)) {
            const video = this.videoCache.get(key);
            return {
                video,
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
            };
        }
        const video = await this.createVideoElement(file);
        await this.loadVideoMetadata(video);
        this.videoCache.set(key, video);
        return {
            video,
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
        };
    }
    /**
     * Create and configure video element
     */
    async createVideoElement(file) {
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
        return video;
    }
    /**
     * Load video metadata
     */
    async loadVideoMetadata(video) {
        return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => resolve();
            video.onerror = () => reject(new Error("Failed to load video"));
        });
    }
    /**
     * Wait for video to seek to the specified time
     */
    async waitForVideoSeek(video) {
        return new Promise((resolve) => {
            const onSeeked = () => {
                video.removeEventListener("seeked", onSeeked);
                resolve();
            };
            video.addEventListener("seeked", onSeeked);
        });
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.videoCache.clear();
    }
}
