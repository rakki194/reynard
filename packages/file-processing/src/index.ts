/**
 * Reynard File Processing - Advanced file processing, thumbnail generation, and media analysis
 *
 * This package provides a comprehensive file processing pipeline for SolidJS applications,
 * supporting multiple file types including images, videos, audio, text, code, and documents.
 *
 * Features:
 * - Multi-format thumbnail generation
 * - Metadata extraction and analysis
 * - Content analysis and processing
 * - Progress tracking and callbacks
 * - Configurable processing options
 * - Web Worker support for background processing
 * - Comprehensive file type support
 */

// Core types and interfaces
export * from "./types";

// Configuration
export * from "./config/file-types";

// Processors
export {
  ThumbnailGenerator,
  type ThumbnailGeneratorOptions,
} from "./processors/thumbnail-generator";

// Specialized generators (for advanced use cases)
export {
  ImageThumbnailGenerator,
  type ImageThumbnailGeneratorOptions,
} from "./processors/ImageThumbnailGenerator";

export {
  VideoThumbnailGenerator,
  type VideoThumbnailGeneratorOptions,
} from "./processors/VideoThumbnailGenerator";

export {
  AudioThumbnailGenerator,
  type AudioThumbnailGeneratorOptions,
} from "./processors/AudioThumbnailGenerator";

export {
  DocumentThumbnailGenerator,
  type DocumentThumbnailGeneratorOptions,
} from "./processors/DocumentThumbnailGenerator";

export {
  ThumbnailGeneratorFactory,
  type ThumbnailGeneratorFactoryOptions,
} from "./processors/ThumbnailGeneratorFactory";

// Metadata extractors
export {
  AudioMetadataExtractor,
  ImageMetadataExtractor,
  VideoMetadataExtractor,
  DocumentMetadataExtractor,
  MetadataExtractorFactory,
  BaseMetadataExtractor,
  type MetadataExtractionOptions,
} from "./processors/extractors";

// Main pipeline
export { FileProcessingPipeline } from "./processing-pipeline";

// Re-export key types for convenience
export type {
  FileMetadata,
  ImageMetadata,
  VideoMetadata,
  AudioMetadata,
  TextMetadata,
  CodeMetadata,
  LoraMetadata,
  DocumentMetadata,
  ThumbnailOptions,
  ProcessingOptions,
  ProcessingResult,
  DirectoryListing,
  FileTypeInfo,
  ProcessingProgress,
  ProcessingConfig,
  ProcessingPipeline,
} from "./types";

// Default configuration
export { DEFAULT_PROCESSING_CONFIG } from "./config/file-types";

// Utility functions
export {
  getFileTypeInfo,
  getMimeType,
  isSupportedExtension,
  getAllSupportedExtensions,
  getFileCategory,
} from "./config/file-types";
