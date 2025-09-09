/**
 * Image Components Barrel Export
 * 
 * Provides clean API boundaries for all image-related components.
 */

// Core Image Components
export { ImageGrid } from "./ImageGrid";

// Re-export types for convenience
export type {
  ImageFile,
  ImageMetadata,
  ImageExifData,
  CameraInfo,
  GpsCoordinates,
  ImageGridState,
  ImageProcessingOptions,
  ImageGridProps,
  ImageFileCardProps,
  ImageViewerProps
} from "../types";
