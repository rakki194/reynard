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
export { ThumbnailGenerator, } from "./processors/thumbnail-generator";
// Specialized generators (for advanced use cases)
export { ImageThumbnailGenerator, } from "./processors/ImageThumbnailGenerator";
export { VideoThumbnailGenerator, } from "./processors/VideoThumbnailGenerator";
export { AudioThumbnailGenerator, } from "./processors/AudioThumbnailGenerator";
export { DocumentThumbnailGenerator, } from "./processors/DocumentThumbnailGenerator";
export { ThumbnailGeneratorFactory, } from "./processors/ThumbnailGeneratorFactory";
// Metadata extractors
export { AudioMetadataExtractor, ImageMetadataExtractor, VideoMetadataExtractor, DocumentMetadataExtractor, MetadataExtractorFactory, BaseMetadataExtractor, } from "./processors/extractors";
// Main pipeline
export { FileProcessingPipeline } from "./processing-pipeline";
// Default configuration
export { DEFAULT_PROCESSING_CONFIG } from "./config/file-types";
// Utility functions
export { getFileTypeInfo, getMimeType, isSupportedExtension, getAllSupportedExtensions, getFileCategory, } from "./config/file-types";
