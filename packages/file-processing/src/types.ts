/**
 * Core types and interfaces for the Reynard File Processing system.
 *
 * This module defines the data structures used throughout the file processing
 * pipeline, providing type safety and consistency across all components.
 */

export interface ExifData {
  /** Camera make */
  Make?: string;
  /** Camera model */
  Model?: string;
  /** Date and time when image was taken */
  DateTime?: string;
  /** Original date and time */
  DateTimeOriginal?: string;
  /** Software used to create the image */
  Software?: string;
  /** GPS latitude */
  GPSLatitude?: number;
  /** GPS longitude */
  GPSLongitude?: number;
  /** GPS altitude */
  GPSAltitude?: number;
  /** Exposure time in seconds */
  ExposureTime?: number;
  /** F-number (aperture) */
  FNumber?: number;
  /** ISO speed rating */
  ISOSpeedRatings?: number;
  /** Focal length in mm */
  FocalLength?: number;
  /** Flash information */
  Flash?: number;
  /** White balance */
  WhiteBalance?: number;
  /** Metering mode */
  MeteringMode?: number;
  /** Exposure program */
  ExposureProgram?: number;
  /** Orientation */
  Orientation?: number;
  /** X resolution */
  XResolution?: number;
  /** Y resolution */
  YResolution?: number;
  /** Resolution unit */
  ResolutionUnit?: number;
  /** Color space */
  ColorSpace?: number;
  /** Additional custom EXIF data */
  [key: string]: string | number | undefined;
}

export interface FileMetadata {
  /** File name with extension */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mime: string;
  /** Last modification time */
  mtime: Date;
  /** File path relative to root directory */
  path: string;
  /** Full absolute path */
  fullPath: string;
  /** File extension (lowercase) */
  extension: string;
  /** Whether file is hidden (starts with .) */
  isHidden: boolean;
  /** Whether file is a directory */
  isDirectory: boolean;
}

export interface ImageMetadata extends FileMetadata {
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Whether image is animated */
  isAnimated: boolean;
  /** Number of frames (1 for static images) */
  frameCount: number;
  /** Animation duration in seconds (0 for static) */
  duration: number;
  /** Color space information */
  colorSpace?: string;
  /** Bit depth */
  bitDepth?: number;
  /** EXIF data if available */
  exif?: ExifData;
}

export interface VideoMetadata extends FileMetadata {
  /** Video width in pixels */
  width: number;
  /** Video height in pixels */
  height: number;
  /** Duration in seconds */
  duration: number;
  /** Frames per second */
  fps: number;
  /** Video bitrate in bits per second */
  bitrate: number;
  /** Video codec name */
  codec: string;
  /** Total frame count */
  frameCount: number;
  /** Audio codec if present */
  audioCodec?: string;
  /** Audio bitrate if present */
  audioBitrate?: number;
}

export interface AudioMetadata extends FileMetadata {
  /** Duration in seconds */
  duration: number;
  /** Audio sample rate in Hz */
  sampleRate: number;
  /** Number of audio channels */
  channels: number;
  /** Audio bitrate in bits per second */
  bitrate: number;
  /** Audio codec name */
  codec: string;
  /** Audio format */
  format: string;
}

export interface TextMetadata extends FileMetadata {
  /** Number of lines in the text file */
  lineCount: number;
  /** Number of characters */
  characterCount: number;
  /** Number of words */
  wordCount: number;
  /** Text encoding */
  encoding: string;
  /** Language detection result */
  language?: string;
  /** Whether file contains structured data (JSON, CSV, etc.) */
  isStructured: boolean;
}

export interface CodeMetadata extends FileMetadata {
  /** Programming language */
  language: string;
  /** Number of lines of code */
  lineCount: number;
  /** Number of characters */
  characterCount: number;
  /** Whether file contains syntax errors */
  hasSyntaxErrors: boolean;
  /** Dependencies detected in the file */
  dependencies?: string[];
  /** File purpose (source, config, documentation, etc.) */
  purpose?: string;
}

export interface LoraMetadata extends FileMetadata {
  /** LoRA model name */
  modelName: string;
  /** Model version */
  version?: string;
  /** Model description */
  description?: string;
  /** Base model this LoRA was trained on */
  baseModel?: string;
  /** Training data information */
  trainingData?: string;
  /** Model tags/categories */
  tags?: string[];
  /** Model parameters */
  parameters?: Record<string, any>;
}

export interface DocumentMetadata extends FileMetadata {
  /** Document type (PDF, DOCX, etc.) */
  documentType: string;
  /** Number of pages */
  pageCount?: number;
  /** Document title */
  title?: string;
  /** Document author */
  author?: string;
  /** Document subject */
  subject?: string;
  /** Document keywords */
  keywords?: string[];
  /** Whether document contains text (vs. scanned) */
  hasText: boolean;
  /** OCR confidence if scanned */
  ocrConfidence?: number;
}

export interface ThumbnailOptions {
  /** Thumbnail dimensions [width, height] */
  size: [number, number];
  /** Output format (webp, png, jpeg) */
  format?: "webp" | "png" | "jpeg";
  /** Quality setting (0-100) */
  quality?: number;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Background color for transparent images */
  backgroundColor?: string;
  /** Whether to enable animation for animated formats */
  enableAnimation?: boolean;
  /** Animation slowdown factor */
  animationSlowdown?: number;
}

export interface ProcessingOptions {
  /** Whether to generate thumbnails */
  generateThumbnails?: boolean;
  /** Whether to extract metadata */
  extractMetadata?: boolean;
  /** Whether to perform OCR on images */
  performOCR?: boolean;
  /** Whether to analyze content */
  analyzeContent?: boolean;
  /** Maximum file size to process (in bytes) */
  maxFileSize?: number;
  /** Supported file types */
  supportedTypes?: string[];
  /** Processing timeout in milliseconds */
  timeout?: number;
}

export interface ProcessingResult<T = any> {
  /** Whether processing was successful */
  success: boolean;
  /** Processing result data */
  data?: T;
  /** Error message if processing failed */
  error?: string;
  /** Processing duration in milliseconds */
  duration: number;
  /** Processing timestamp */
  timestamp: Date;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface DirectoryListing {
  /** Directory path */
  path: string;
  /** Directory modification time */
  mtime: Date;
  /** List of subdirectories */
  directories: DirectoryMetadata[];
  /** List of files */
  files: FileMetadata[];
  /** Total count of items */
  totalCount: number;
  /** Pagination information */
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface DirectoryMetadata {
  /** Directory name */
  name: string;
  /** Directory path */
  path: string;
  /** Last modification time */
  mtime: Date;
  /** Number of items in directory */
  itemCount: number;
  /** Whether directory is empty */
  isEmpty: boolean;
}

export interface FileTypeInfo {
  /** File extension */
  extension: string;
  /** MIME type */
  mimeType: string;
  /** File category */
  category:
    | "image"
    | "video"
    | "audio"
    | "text"
    | "code"
    | "document"
    | "archive"
    | "other";
  /** Whether type is supported */
  isSupported: boolean;
  /** Processing capabilities */
  capabilities: {
    thumbnail: boolean;
    metadata: boolean;
    content: boolean;
    ocr: boolean;
  };
}

export interface ProcessingProgress {
  /** Current operation */
  operation: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current file being processed */
  currentFile?: string;
  /** Total files to process */
  totalFiles?: number;
  /** Processed files count */
  processedFiles?: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
  /** Status message */
  status: string;
}

export interface CacheEntry<T = any> {
  /** Cache key */
  key: string;
  /** Cached data */
  data: T;
  /** Cache timestamp */
  timestamp: Date;
  /** Cache expiration time */
  expiresAt: Date;
  /** Cache hit count */
  hitCount: number;
  /** Cache size in bytes */
  size: number;
}

export interface ProcessingError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error details */
  details?: any;
  /** File that caused the error */
  file?: string;
  /** Error timestamp */
  timestamp: Date;
  /** Whether error is recoverable */
  recoverable: boolean;
}

export type FileProcessor<T = any> = (
  file: File | string,
  options?: ProcessingOptions,
) => Promise<ProcessingResult<T>>;

export type ThumbnailGenerator = (
  file: File | string,
  options: ThumbnailOptions,
) => Promise<ProcessingResult<Blob | string>>;

export type MetadataExtractor<T = any> = (
  file: File | string,
) => Promise<ProcessingResult<T>>;

export interface ProcessingPipeline {
  /** Process a single file */
  processFile(
    file: File | string,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult>;
  /** Process multiple files */
  processFiles(
    files: (File | string)[],
    options?: ProcessingOptions,
  ): Promise<ProcessingResult[]>;
  /** Generate thumbnail for a file */
  generateThumbnail(
    file: File | string,
    options: ThumbnailOptions,
  ): Promise<ProcessingResult<Blob | string>>;
  /** Extract metadata from a file */
  extractMetadata(file: File | string): Promise<ProcessingResult>;
  /** Scan directory contents */
  scanDirectory(
    path: string,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult<DirectoryListing>>;
  /** Get supported file types */
  getSupportedTypes(): FileTypeInfo[];
  /** Check if file type is supported */
  isSupported(file: File | string): boolean;
}

export interface ProcessingConfig {
  /** Default thumbnail size */
  defaultThumbnailSize: [number, number];
  /** Default preview size */
  defaultPreviewSize: [number, number];
  /** Supported file extensions */
  supportedExtensions: string[];
  /** Maximum file size for processing */
  maxFileSize: number;
  /** Processing timeout */
  timeout: number;
  /** Cache settings */
  cache: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
  /** Threading settings */
  threading: {
    maxWorkers: number;
    thumbnailWorkers: number;
    metadataWorkers: number;
  };
}
