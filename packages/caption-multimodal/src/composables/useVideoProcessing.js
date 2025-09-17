/**
 * Video Processing Composable for Reynard Caption System
 *
 * Handles video file processing, thumbnail generation, and metadata extraction.
 */
import { VideoMetadataExtractor, VideoThumbnailGenerator } from "reynard-file-processing";
import { createSignal } from "solid-js";
export const useVideoProcessing = (options = {}) => {
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    // Initialize processors with options
    const thumbnailGenerator = new VideoThumbnailGenerator({
        size: options.thumbnailSize || [200, 200],
        format: options.thumbnailFormat || "webp",
        quality: options.thumbnailQuality || 85,
        maintainAspectRatio: options.maintainAspectRatio ?? true,
        captureTime: options.captureTime || 2,
    });
    const metadataExtractor = new VideoMetadataExtractor();
    const processVideoFile = async (file) => {
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
            const videoFile = {
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file),
                thumbnail: thumbnailResult.data,
                metadata,
                uploadedAt: new Date(),
            };
            return videoFile;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to process video file";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
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
