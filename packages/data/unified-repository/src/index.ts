/**
 * Reynard Unified Repository
 *
 * Main entry point for the unified repository and multimodal dataset management system.
 * Built on Reynard's modular architecture with comprehensive search, versioning, and metadata capabilities.
 */

// Core types and interfaces
export * from "./types";

// Main repository service
export { Repository } from "./services/Repository";

// Individual services (only export what exists)
export { FileService } from "./services/FileService";
export { MetadataService } from "./services/MetadataService";
export { ParquetService } from "./services/ParquetService";

// Constants
export { DEFAULT_EMBEDDING_DIMENSIONS, DEFAULT_THUMBNAIL_SIZE, MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from "./constants";

// Error classes
export { RepositoryError } from "./types";
