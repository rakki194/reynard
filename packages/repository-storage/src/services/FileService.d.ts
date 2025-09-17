/**
 * File Service
 *
 * Service for managing files in the unified repository, integrating with
 * existing file processing capabilities and providing comprehensive file operations.
 */
import type { FileFilters, IngestionRequest, IngestionResult, RepositoryFile } from "../types";
export declare class FileService extends BaseAIService {
    private processingPipeline;
    private parquetService;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Ingest files into a dataset
     */
    ingestFiles(request: IngestionRequest): Promise<IngestionResult>;
    /**
     * Process a single file
     */
    private processFile;
    /**
     * Process parquet file with specialized handling
     */
    private processParquetFile;
    /**
     * Get file by ID
     */
    getFile(id: string): Promise<RepositoryFile>;
    /**
     * Update file metadata
     */
    updateFile(id: string, updates: Partial<RepositoryFile>): Promise<RepositoryFile>;
    /**
     * Delete file
     */
    deleteFile(id: string): Promise<void>;
    /**
     * List files in a dataset
     */
    listFiles(datasetId: string, filters?: FileFilters): Promise<RepositoryFile[]>;
    /**
     * Get all files (for health checks and statistics)
     */
    getAllFiles(): Promise<RepositoryFile[]>;
    /**
     * Bulk update files
     */
    bulkUpdateFiles(datasetId: string, updates: Array<{
        id: string;
        updates: Partial<RepositoryFile>;
    }>): Promise<RepositoryFile[]>;
    /**
     * Determine file type from path
     */
    private determineFileType;
    /**
     * Determine modality from file type
     */
    private determineModality;
    /**
     * Ensure service is initialized
     */
    private ensureInitialized;
}
