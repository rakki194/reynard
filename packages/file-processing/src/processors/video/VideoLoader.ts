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

export class VideoLoader {
  private videoCache = new Map<string, HTMLVideoElement>();

  /**
   * Load video file with caching
   */
  async loadVideo(file: File | string): Promise<VideoLoadResult> {
    const key = typeof file === "string" ? file : file.name;

    if (this.videoCache.has(key)) {
      const video = this.videoCache.get(key)!;
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
  private async createVideoElement(
    file: File | string,
  ): Promise<HTMLVideoElement> {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    if (typeof file === "string") {
      video.src = file;
    } else {
      video.src = URL.createObjectURL(file);
    }

    return video;
  }

  /**
   * Load video metadata
   */
  private async loadVideoMetadata(video: HTMLVideoElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video"));
    });
  }

  /**
   * Wait for video to seek to the specified time
   */
  async waitForVideoSeek(video: HTMLVideoElement): Promise<void> {
    return new Promise<void>((resolve) => {
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
  destroy(): void {
    this.videoCache.clear();
  }
}
