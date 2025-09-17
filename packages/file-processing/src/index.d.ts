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
export * from "./types";
export * from "./config/file-types";
export { ThumbnailGenerator, type ThumbnailGeneratorOptions, } from "./processors/thumbnail-generator";
export { ImageThumbnailGenerator, type ImageThumbnailGeneratorOptions, } from "./processors/ImageThumbnailGenerator";
export { VideoThumbnailGenerator, type VideoThumbnailGeneratorOptions, } from "./processors/VideoThumbnailGenerator";
export { AudioThumbnailGenerator, type AudioThumbnailGeneratorOptions, } from "./processors/AudioThumbnailGenerator";
export { DocumentThumbnailGenerator, type DocumentThumbnailGeneratorOptions, } from "./processors/DocumentThumbnailGenerator";
export { ThumbnailGeneratorFactory, type ThumbnailGeneratorFactoryOptions, } from "./processors/ThumbnailGeneratorFactory";
export { AudioMetadataExtractor, ImageMetadataExtractor, VideoMetadataExtractor, DocumentMetadataExtractor, MetadataExtractorFactory, BaseMetadataExtractor, type MetadataExtractionOptions, } from "./processors/extractors";
export { FileProcessingPipeline } from "./processing-pipeline";
export type { FileMetadata, ImageMetadata, VideoMetadata, AudioMetadata, TextMetadata, CodeMetadata, LoraMetadata, DocumentMetadata, ThumbnailOptions, ProcessingOptions, ProcessingResult, DirectoryListing, FileTypeInfo, ProcessingProgress, ProcessingConfig, ProcessingPipeline, } from "./types";
export { DEFAULT_PROCESSING_CONFIG } from "./config/file-types";
export { getFileTypeInfo, getMimeType, isSupportedExtension, getAllSupportedExtensions, getFileCategory, } from "./config/file-types";
