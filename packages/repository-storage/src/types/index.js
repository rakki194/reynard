/**
 * Core types and interfaces for the Reynard Unified Repository system.
 *
 * This module defines the fundamental data structures for managing
 * multimodal datasets with comprehensive type safety.
 */
export var DatasetStatus;
(function (DatasetStatus) {
    DatasetStatus["DRAFT"] = "draft";
    DatasetStatus["ACTIVE"] = "active";
    DatasetStatus["ARCHIVED"] = "archived";
    DatasetStatus["PROCESSING"] = "processing";
    DatasetStatus["ERROR"] = "error";
})(DatasetStatus || (DatasetStatus = {}));
export var FileType;
(function (FileType) {
    // Data formats
    FileType["PARQUET"] = "parquet";
    FileType["ARROW"] = "arrow";
    FileType["FEATHER"] = "feather";
    FileType["HDF5"] = "hdf5";
    FileType["CSV"] = "csv";
    FileType["TSV"] = "tsv";
    FileType["JSON"] = "json";
    FileType["JSONL"] = "jsonl";
    // Media formats
    FileType["IMAGE"] = "image";
    FileType["VIDEO"] = "video";
    FileType["AUDIO"] = "audio";
    // Document formats
    FileType["PDF"] = "pdf";
    FileType["HTML"] = "html";
    FileType["MARKDOWN"] = "markdown";
    FileType["DOCX"] = "docx";
    FileType["EPUB"] = "epub";
    // Text formats
    FileType["TEXT"] = "text";
    // Code formats
    FileType["CODE"] = "code";
    // Archive formats
    FileType["ZIP"] = "zip";
    FileType["TAR"] = "tar";
    FileType["GZIP"] = "gzip";
})(FileType || (FileType = {}));
export var ModalityType;
(function (ModalityType) {
    ModalityType["TEXT"] = "text";
    ModalityType["IMAGE"] = "image";
    ModalityType["AUDIO"] = "audio";
    ModalityType["VIDEO"] = "video";
    ModalityType["DATA"] = "data";
    ModalityType["CODE"] = "code";
    ModalityType["DOCUMENT"] = "document";
})(ModalityType || (ModalityType = {}));
// ============================================================================
// Error Types
// ============================================================================
export class RepositoryError extends Error {
    constructor(message, code, details) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: details
        });
        this.name = "RepositoryError";
    }
}
export class DatasetNotFoundError extends RepositoryError {
    constructor(datasetId) {
        super(`Dataset not found: ${datasetId}`, "DATASET_NOT_FOUND", { datasetId });
    }
}
export class FileNotFoundError extends RepositoryError {
    constructor(fileId) {
        super(`File not found: ${fileId}`, "FILE_NOT_FOUND", { fileId });
    }
}
export class IngestionError extends RepositoryError {
    constructor(message, details) {
        super(message, "INGESTION_ERROR", details);
    }
}
export class SearchError extends RepositoryError {
    constructor(message, details) {
        super(message, "SEARCH_ERROR", details);
    }
}
