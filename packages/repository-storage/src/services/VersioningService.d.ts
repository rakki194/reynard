/**
 * Versioning Service
 *
 * Comprehensive versioning service for datasets and files in the unified repository.
 * Provides semantic versioning, change tracking, and version comparison capabilities.
 */
import type { DatasetLineage, DatasetVersion, VersionChange, VersionComparison } from "../types";
export interface VersionCreationOptions {
    description?: string;
    changes?: VersionChange[];
    metadata?: Record<string, any>;
    autoIncrement?: boolean;
    versionType?: "major" | "minor" | "patch";
}
export interface VersionComparisonOptions {
    includeMetadata?: boolean;
    includeFileChanges?: boolean;
    includeStatistics?: boolean;
}
export interface VersionHistoryOptions {
    limit?: number;
    offset?: number;
    includeChanges?: boolean;
    sortOrder?: "asc" | "desc";
}
export declare class VersioningService extends BaseAIService {
    private initialized;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Create a new version for a dataset
     */
    createVersion(datasetId: string, options?: VersionCreationOptions): Promise<DatasetVersion>;
    /**
     * Get current version of a dataset
     */
    getCurrentVersion(datasetId: string): Promise<DatasetVersion | null>;
    /**
     * Get specific version of a dataset
     */
    getVersion(datasetId: string, version: string): Promise<DatasetVersion>;
    /**
     * List all versions of a dataset
     */
    listVersions(datasetId: string, options?: VersionHistoryOptions): Promise<DatasetVersion[]>;
    /**
     * Compare two versions of a dataset
     */
    compareVersions(datasetId: string, version1: string, version2: string, options?: VersionComparisonOptions): Promise<VersionComparison>;
    /**
     * Get version lineage for a dataset
     */
    getVersionLineage(datasetId: string): Promise<DatasetLineage>;
    /**
     * Rollback to a previous version
     */
    rollbackToVersion(datasetId: string, targetVersion: string, createNewVersion?: boolean): Promise<DatasetVersion>;
    /**
     * Tag a version (create a named tag for easy reference)
     */
    tagVersion(datasetId: string, version: string, tag: string, description?: string): Promise<void>;
    /**
     * Get version by tag
     */
    getVersionByTag(datasetId: string, tag: string): Promise<DatasetVersion>;
    /**
     * List all tags for a dataset
     */
    listTags(datasetId: string): Promise<Array<{
        tag: string;
        version: string;
        description?: string;
        createdAt: Date;
    }>>;
    /**
     * Delete a version (soft delete)
     */
    deleteVersion(datasetId: string, version: string): Promise<void>;
    /**
     * Increment version number based on type
     */
    private incrementVersion;
    /**
     * Calculate changes between two versions
     */
    private calculateChanges;
    /**
     * Generate unique version ID
     */
    private generateVersionId;
    /**
     * Ensure service is initialized
     */
    private ensureInitialized;
}
