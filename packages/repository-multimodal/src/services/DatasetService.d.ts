/**
 * Dataset Service
 *
 * Core service for managing datasets in the unified repository.
 * Provides CRUD operations, versioning, and dataset lifecycle management.
 */
import type { Dataset, DatasetFilters, DatasetLineage, DatasetStatistics, DatasetVersion, RepositoryFile } from "../types";
export interface DatasetCreationOptions {
    description?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    version?: string;
    status?: "draft" | "active" | "archived";
}
export interface DatasetUpdateOptions {
    name?: string;
    description?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    status?: "draft" | "active" | "archived";
}
export interface DatasetQueryOptions {
    includeFiles?: boolean;
    includeVersions?: boolean;
    includeStatistics?: boolean;
    includeLineage?: boolean;
}
export declare class DatasetService extends BaseAIService {
    private initialized;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Create a new dataset
     */
    createDataset(name: string, options?: DatasetCreationOptions): Promise<Dataset>;
    /**
     * Get dataset by ID
     */
    getDataset(id: string, options?: DatasetQueryOptions): Promise<Dataset>;
    /**
     * Update dataset
     */
    updateDataset(id: string, updates: DatasetUpdateOptions): Promise<Dataset>;
    /**
     * Delete dataset
     */
    deleteDataset(id: string): Promise<void>;
    /**
     * List datasets with optional filters
     */
    listDatasets(filters?: DatasetFilters): Promise<Dataset[]>;
    /**
     * Get dataset statistics
     */
    getDatasetStatistics(id: string): Promise<DatasetStatistics>;
    /**
     * Create a new version of a dataset
     */
    createVersion(datasetId: string, version: Omit<DatasetVersion, "id" | "datasetId" | "createdAt">): Promise<DatasetVersion>;
    /**
     * Get dataset version
     */
    getVersion(datasetId: string, version: string): Promise<DatasetVersion>;
    /**
     * List all versions of a dataset
     */
    listVersions(datasetId: string): Promise<DatasetVersion[]>;
    /**
     * Get dataset lineage
     */
    getDatasetLineage(id: string): Promise<DatasetLineage>;
    /**
     * Add files to dataset
     */
    addFilesToDataset(datasetId: string, fileIds: string[]): Promise<RepositoryFile[]>;
    /**
     * Remove files from dataset
     */
    removeFilesFromDataset(datasetId: string, fileIds: string[]): Promise<void>;
    /**
     * Get files in dataset
     */
    getDatasetFiles(datasetId: string, options?: {
        includeMetadata?: boolean;
        includeEmbeddings?: boolean;
    }): Promise<RepositoryFile[]>;
    /**
     * Clone dataset
     */
    cloneDataset(sourceId: string, newName: string, options?: DatasetCreationOptions): Promise<Dataset>;
    /**
     * Archive dataset
     */
    archiveDataset(id: string): Promise<Dataset>;
    /**
     * Restore archived dataset
     */
    restoreDataset(id: string): Promise<Dataset>;
    /**
     * Generate unique dataset ID
     */
    private generateDatasetId;
    /**
     * Generate unique version ID
     */
    private generateVersionId;
    /**
     * Ensure service is initialized
     */
    private ensureInitialized;
}
