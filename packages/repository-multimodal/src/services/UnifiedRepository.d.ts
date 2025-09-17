/**
 * Unified Repository Service
 *
 * Main service for managing multimodal datasets and files in the Reynard ecosystem.
 * Provides a unified interface for file management, metadata handling, and parquet processing.
 */
import type { FileMetadata, ListOptions, RepositoryConfig, RepositoryService, UploadOptions } from "../types";
import { FileService } from "./FileService";
import { MetadataService } from "./MetadataService";
import { ParquetService } from "./ParquetService";
export declare class UnifiedRepository implements RepositoryService {
    private fileService;
    private metadataService;
    private parquetService;
    private config;
    private initialized;
    constructor(config: RepositoryConfig);
    private initializeServices;
    /**
     * Initialize the repository and all services
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the repository and cleanup resources
     */
    shutdown(): Promise<void>;
    /**
     * Get health status of all services
     */
    getHealthStatus(): Promise<any>;
    uploadFile(file: File, datasetId: string, options?: UploadOptions): Promise<string>;
    getFile(fileId: string): Promise<FileMetadata>;
    deleteFile(fileId: string): Promise<void>;
    listFiles(datasetId: string, options?: ListOptions): Promise<FileMetadata[]>;
    updateMetadata(fileId: string, metadata: Partial<FileMetadata>): Promise<void>;
    getMetadata(fileId: string): Promise<FileMetadata>;
    processParquetFile(filePath: string): Promise<any>;
    queryParquetFile(filePath: string, options?: any): Promise<any>;
    get file(): FileService;
    get metadata(): MetadataService;
    get parquet(): ParquetService;
    private ensureInitialized;
}
