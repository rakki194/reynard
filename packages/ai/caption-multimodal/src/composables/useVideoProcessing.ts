/**
 * Video Processing Composable for Reynard Caption System
 *
 * Handles video file processing, thumbnail generation, and metadata extraction.
 */

import { VideoMetadataExtractor, VideoThumbnailGenerator } from "reynard-file-processing";
import { VideoFile } from "reynard-video";
import { Accessor, createSignal } from "solid-js";

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

export const useVideoProcessing = (options: UseVideoProcessingOptions = {}): UseVideoProcessingReturn => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize processors with options
  const thumbnailGenerator = new VideoThumbnailGenerator({
    size: options.thumbnailSize || [200, 200],
    format: options.thumbnailFormat || "webp",
    quality: options.thumbnailQuality || 85,
    maintainAspectRatio: options.maintainAspectRatio ?? true,
    captureTime: options.captureTime || 2,
  });

  const metadataExtractor = new VideoMetadataExtractor();

  const processVideoFile = async (file: File): Promise<VideoFile> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate thumbnail using existing infrastructure
      const thumbnailResult = await thumbnailGenerator.generateThumbnail(file);
      if (!thumbnailResult.success) {
        throw new Error(thumbnailResult.error || "Failed to generate thumbnail");
      }

      // Extract metadata using existing infrastructure
      const metadata = await metadataExtractor.extractMetadata(file);

      const videoFile: VideoFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        thumbnail: thumbnailResult.data as Blob,
        metadata,
        uploadedAt: new Date(),
      };

      return videoFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process video file";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const destroy = () => {
    thumbnailGenerator.destroy();
  };

  return {
    isLoading,
    error,
    processVideoFile,
    destroy,
  };
};
