/**
 * Constants for the Reynard Unified Repository system.
 *
 * Defines supported file types, modalities, and default configurations.
 */
import { FileType, ModalityType } from "./types";
export declare const SUPPORTED_FILE_TYPES: Record<ModalityType, FileType[]>;
export declare const FILE_EXTENSION_MAP: Record<string, FileType>;
export declare const MODALITY_MAP: Record<FileType, ModalityType>;
export declare const MIME_TYPE_MAP: Record<string, string>;
export declare const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
export declare const MAX_FILE_SIZE: number;
export declare const DEFAULT_THUMBNAIL_SIZE: [number, number];
export declare const DEFAULT_BATCH_SIZE = 100;
export declare const DEFAULT_CHUNK_SIZE = 10000;
export declare const DEFAULT_SIMILARITY_THRESHOLD = 0.7;
export declare const DEFAULT_TOP_K = 20;
export declare const DEFAULT_PROCESSING_OPTIONS: {
    generateThumbnails: boolean;
    extractMetadata: boolean;
    generateEmbeddings: boolean;
    validateSchema: boolean;
    overwrite: boolean;
    batchSize: number;
    chunkSize: number;
};
export declare const DEFAULT_SEARCH_OPTIONS: {
    topK: number;
    similarityThreshold: number;
    hybrid: boolean;
    rerank: boolean;
    includeMetadata: boolean;
    includeEmbeddings: boolean;
};
export declare const DEFAULT_DATABASE_CONFIG: {
    host: string;
    port: number;
    database: string;
    poolSize: number;
    ssl: boolean;
};
export declare const DEFAULT_STORAGE_CONFIG: {
    type: "local";
    path: string;
};
export declare const DEFAULT_EMBEDDING_CONFIG: {
    textModel: string;
    imageModel: string;
    audioModel: string;
    dataModel: string;
    dimensions: number;
    batchSize: number;
};
export declare const ERROR_CODES: {
    readonly NOT_INITIALIZED: "NOT_INITIALIZED";
    readonly INITIALIZATION_ERROR: "INITIALIZATION_ERROR";
    readonly SHUTDOWN_ERROR: "SHUTDOWN_ERROR";
    readonly FILE_NOT_FOUND: "FILE_NOT_FOUND";
    readonly FILE_PROCESSING_ERROR: "FILE_PROCESSING_ERROR";
    readonly FILE_SERVICE_NOT_INITIALIZED: "FILE_SERVICE_NOT_INITIALIZED";
    readonly DATASET_NOT_FOUND: "DATASET_NOT_FOUND";
    readonly DATASET_CREATION_ERROR: "DATASET_CREATION_ERROR";
    readonly PARQUET_NOT_INITIALIZED: "PARQUET_NOT_INITIALIZED";
    readonly PARQUET_INIT_ERROR: "PARQUET_INIT_ERROR";
    readonly PARQUET_PROCESSING_ERROR: "PARQUET_PROCESSING_ERROR";
    readonly PARQUET_QUERY_ERROR: "PARQUET_QUERY_ERROR";
    readonly SEARCH_ERROR: "SEARCH_ERROR";
    readonly EMBEDDING_ERROR: "EMBEDDING_ERROR";
    readonly INGESTION_ERROR: "INGESTION_ERROR";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
};
export declare const DATASET_STATUS: {
    readonly DRAFT: "draft";
    readonly ACTIVE: "active";
    readonly ARCHIVED: "archived";
    readonly PROCESSING: "processing";
    readonly ERROR: "error";
};
export declare const FILE_STATUS: {
    readonly PENDING: "pending";
    readonly PROCESSING: "processing";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
    readonly SKIPPED: "skipped";
};
/**
 * Get file type from extension
 */
export declare function getFileTypeFromExtension(extension: string): FileType;
/**
 * Get modality from file type
 */
export declare function getModalityFromFileType(fileType: FileType): ModalityType;
/**
 * Get MIME type from extension
 */
export declare function getMimeTypeFromExtension(extension: string): string;
/**
 * Check if file type is supported
 */
export declare function isFileTypeSupported(extension: string): boolean;
/**
 * Get all supported extensions
 */
export declare function getAllSupportedExtensions(): string[];
/**
 * Get extensions for modality
 */
export declare function getExtensionsForModality(modality: ModalityType): string[];
