/**
 * Unified Repository Service
 *
 * Main service for managing multimodal datasets and files in the Reynard ecosystem.
 * Provides a unified interface for file management, metadata handling, and parquet processing.
 */

import type { 
  Dataset, 
  DatasetFilters, 
  DatasetLineage,
  DatasetVersion,
  FileFilters, 
  IngestionRequest, 
  IngestionResult, 
  RepositoryConfig, 
  RepositoryFile, 
  RepositoryService,
  SearchOptions,
  SearchQuery,
  SearchResult
} from "../types";
import { 
  ModalityType,
  FileType,
  DatasetStatus,
  IngestionError
} from "../types";
import { RepositoryError, DatasetNotFoundError, FileNotFoundError } from "../types";
import { BaseRepositoryService, type ServiceConfig } from "reynard-repository-core";

export class UnifiedRepository extends BaseRepositoryService implements RepositoryService {
  private repositoryConfig: RepositoryConfig;
  private datasets: Map<string, Dataset> = new Map();
  private files: Map<string, RepositoryFile> = new Map();
  private versions: Map<string, DatasetVersion[]> = new Map();

  constructor(config: RepositoryConfig) {
    super({
      name: "UnifiedRepository",
      version: "1.0.0",
      timeout: 30000,
      retries: 3,
      healthCheckInterval: 60000
    });
    this.repositoryConfig = config;
  }

  protected async onInitialize(): Promise<void> {
    // Initialize database connections, storage backends, etc.
    console.log("Initializing UnifiedRepository with config:", this.repositoryConfig);
    
    // Initialize datasets and files from storage
    await this.loadExistingData();
  }

  protected async onShutdown(): Promise<void> {
    // Clean up resources, close connections, etc.
    console.log("Shutting down UnifiedRepository");
    this.datasets.clear();
    this.files.clear();
    this.versions.clear();
  }

  protected async onHealthCheck(): Promise<{ healthy: boolean; metadata?: Record<string, any> }> {
    const datasetCount = this.datasets.size;
    const fileCount = this.files.size;
    const versionCount = Array.from(this.versions.values()).flat().length;

    return {
      healthy: true,
      metadata: {
        datasets: datasetCount,
        files: fileCount,
        versions: versionCount,
        config: {
          database: this.repositoryConfig.database.host,
          storage: this.repositoryConfig.storage.type
        }
      }
    };
  }

  // Dataset Management
  async createDataset(dataset: Omit<Dataset, "id" | "createdAt" | "updatedAt">): Promise<Dataset> {
    this.ensureInitialized();
    
    const id = this.generateId();
    const now = new Date();
    
    const newDataset: Dataset = {
      ...dataset,
      id,
      createdAt: now,
      updatedAt: now,
      status: DatasetStatus.DRAFT,
      statistics: {
        totalFiles: 0,
        totalSize: 0,
        fileTypeCounts: {},
        modalityCounts: {
          [ModalityType.TEXT]: 0,
          [ModalityType.IMAGE]: 0,
          [ModalityType.AUDIO]: 0,
          [ModalityType.VIDEO]: 0,
          [ModalityType.DATA]: 0,
          [ModalityType.DOCUMENT]: 0,
          [ModalityType.CODE]: 0
        },
        lastIngested: now
      }
    };

    this.datasets.set(id, newDataset);
    return newDataset;
  }

  async getDataset(id: string): Promise<Dataset> {
    this.ensureInitialized();
    
    const dataset = this.datasets.get(id);
    if (!dataset) {
      throw new DatasetNotFoundError(id);
    }
    
    return dataset;
  }

  async updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset> {
    this.ensureInitialized();
    
    const dataset = await this.getDataset(id);
    const updatedDataset = {
      ...dataset,
      ...updates,
      updatedAt: new Date()
    };
    
    this.datasets.set(id, updatedDataset);
    return updatedDataset;
  }

  async deleteDataset(id: string): Promise<void> {
    this.ensureInitialized();
    
    const dataset = await this.getDataset(id);
    
    // Delete all files in the dataset
    const files = Array.from(this.files.values()).filter(f => f.datasetId === id);
    for (const file of files) {
      this.files.delete(file.id);
    }
    
    // Delete dataset versions
    this.versions.delete(id);
    
    // Delete dataset
    this.datasets.delete(id);
  }

  async listDatasets(filters?: DatasetFilters): Promise<Dataset[]> {
    this.ensureInitialized();
    
    let datasets = Array.from(this.datasets.values());
    
    if (filters) {
      if (filters.status) {
        datasets = datasets.filter(d => filters.status!.includes(d.status));
      }
      if (filters.tags) {
        datasets = datasets.filter(d => 
          filters.tags!.some(tag => d.tags.includes(tag))
        );
      }
      if (filters.createdBy) {
        datasets = datasets.filter(d => 
          filters.createdBy!.includes(d.createdBy)
        );
      }
      if (filters.dateRange) {
        datasets = datasets.filter(d => 
          d.createdAt >= filters.dateRange!.from && 
          d.createdAt <= filters.dateRange!.to
        );
      }
    }
    
    return datasets;
  }

  // File Management
  async ingestFiles(request: IngestionRequest): Promise<IngestionResult> {
    this.ensureInitialized();
    
    const dataset = await this.getDataset(request.datasetId);
    const results: IngestionResult = {
      success: true,
      filesProcessed: 0,
      filesSkipped: 0,
      errors: [],
      statistics: {
        totalSize: 0,
        processingTime: 0,
        embeddingsGenerated: 0,
        metadataExtracted: 0,
        thumbnailsGenerated: 0
      }
    };

    const startTime = Date.now();

    for (const file of request.files) {
      try {
        const fileId = this.generateId();
        const now = new Date();
        
        const repositoryFile: RepositoryFile = {
          id: fileId,
          datasetId: request.datasetId,
          path: file.path,
          name: file.path.split('/').pop() || file.path,
          type: this.getMimeTypeFromPath(file.path),
          fileType: this.getFileTypeFromPath(file.path),
          modality: this.getModalityFromFileType(this.getFileTypeFromPath(file.path)),
          size: 0, // Would be determined from actual file
          hash: this.generateHash(file.path),
          metadata: {
            mimeType: this.getMimeTypeFromPath(file.path),
            lastModified: now,
            checksum: this.generateHash(file.path),
            custom: file.metadata || {}
          },
          createdAt: now,
          updatedAt: now
        };

        this.files.set(fileId, repositoryFile);
        results.filesProcessed++;
        results.statistics.totalSize += repositoryFile.size;
        
        if (request.options?.extractMetadata) {
          results.statistics.metadataExtracted++;
        }
        if (request.options?.generateEmbeddings) {
          results.statistics.embeddingsGenerated++;
        }
        if (request.options?.generateThumbnails) {
          results.statistics.thumbnailsGenerated++;
        }
        
    } catch (error) {
        results.errors.push(new IngestionError(
          error instanceof Error ? error.message : String(error),
          { file: file.path, code: "PROCESSING_ERROR" }
        ));
      }
    }

    results.statistics.processingTime = Date.now() - startTime;
    
    // Update dataset statistics
    await this.updateDatasetStatistics(request.datasetId);
    
    return results;
  }

  async getFile(id: string): Promise<RepositoryFile> {
    this.ensureInitialized();
    
    const file = this.files.get(id);
    if (!file) {
      throw new FileNotFoundError(id);
    }
    
    return file;
  }

  async updateFile(id: string, updates: Partial<RepositoryFile>): Promise<RepositoryFile> {
    this.ensureInitialized();
    
    const file = await this.getFile(id);
    const updatedFile = {
      ...file,
      ...updates,
      updatedAt: new Date()
    };
    
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    this.ensureInitialized();
    
    const file = await this.getFile(id);
    this.files.delete(id);
    
    // Update dataset statistics
    await this.updateDatasetStatistics(file.datasetId);
  }

  async listFiles(datasetId: string, filters?: FileFilters): Promise<RepositoryFile[]> {
    this.ensureInitialized();
    
    let files = Array.from(this.files.values()).filter(f => f.datasetId === datasetId);
    
    if (filters) {
      if (filters.fileTypes) {
        files = files.filter(f => filters.fileTypes!.includes(f.fileType));
      }
      if (filters.modalities) {
        files = files.filter(f => filters.modalities!.includes(f.modality));
      }
      if (filters.tags) {
        files = files.filter(f => 
          filters.tags!.some(tag => f.metadata.custom.tags?.includes(tag))
        );
      }
      if (filters.dateRange) {
        files = files.filter(f => 
          f.createdAt >= filters.dateRange!.from && 
          f.createdAt <= filters.dateRange!.to
        );
      }
      if (filters.sizeRange) {
        files = files.filter(f => 
          f.size >= filters.sizeRange!.min && 
          f.size <= filters.sizeRange!.max
        );
      }
    }
    
    return files;
  }

  // Search
  async search(query: SearchQuery): Promise<SearchResult[]> {
    this.ensureInitialized();
    
    // Simple text-based search implementation
    const results: SearchResult[] = [];
    const searchTerm = query.query.toLowerCase();
    
    for (const file of this.files.values()) {
      if (query.modalities && !query.modalities.includes(file.modality)) {
        continue;
      }
      if (query.fileTypes && !query.fileTypes.includes(file.fileType)) {
        continue;
      }
      if (query.datasets && !query.datasets.includes(file.datasetId)) {
        continue;
      }
      
      // Simple text matching
      const matches = file.name.toLowerCase().includes(searchTerm) ||
                     file.path.toLowerCase().includes(searchTerm) ||
                     file.metadata.title?.toLowerCase().includes(searchTerm) ||
                     file.metadata.description?.toLowerCase().includes(searchTerm);
      
      if (matches) {
        const dataset = this.datasets.get(file.datasetId);
        if (dataset) {
          results.push({
            id: this.generateId(),
            content: file.name,
            score: 0.8, // Simple scoring
            file,
            dataset,
            modality: file.modality,
            relevanceScore: 0.8
          });
        }
      }
    }
    
    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Apply topK limit
    const topK = query.options?.topK || 20;
    return results.slice(0, topK);
  }

  async getSimilarFiles(fileId: string, options?: SearchOptions): Promise<SearchResult[]> {
    this.ensureInitialized();
    
    const file = await this.getFile(fileId);
    const dataset = await this.getDataset(file.datasetId);
    
    // Find files with same modality and similar characteristics
    const similarFiles = Array.from(this.files.values()).filter(f => 
      f.id !== fileId && 
      f.modality === file.modality &&
      f.fileType === file.fileType
    );
    
    return similarFiles.map(f => ({
      id: this.generateId(),
      content: f.name,
      score: 0.7,
      file: f,
      dataset,
      modality: f.modality,
      relevanceScore: 0.7
    }));
  }

  // Versioning
  async createVersion(datasetId: string, version: Omit<DatasetVersion, "id" | "datasetId" | "createdAt">): Promise<DatasetVersion> {
    this.ensureInitialized();
    
    await this.getDataset(datasetId);
    
    const versionId = this.generateId();
    const now = new Date();
    
    const newVersion: DatasetVersion = {
      ...version,
      id: versionId,
      datasetId,
      createdAt: now
    };
    
    const versions = this.versions.get(datasetId) || [];
    versions.push(newVersion);
    this.versions.set(datasetId, versions);
    
    return newVersion;
  }

  async getVersion(datasetId: string, version: string): Promise<DatasetVersion> {
    this.ensureInitialized();
    
    const versions = this.versions.get(datasetId) || [];
    const foundVersion = versions.find(v => v.version === version);
    
    if (!foundVersion) {
      throw new RepositoryError(`Version ${version} not found for dataset ${datasetId}`, "VERSION_NOT_FOUND");
    }
    
    return foundVersion;
  }

  async listVersions(datasetId: string): Promise<DatasetVersion[]> {
    this.ensureInitialized();
    
    return this.versions.get(datasetId) || [];
  }

  async getLineage(datasetId: string): Promise<DatasetLineage> {
    this.ensureInitialized();
    
    const versions = await this.listVersions(datasetId);
    
    return {
      datasetId,
      versions,
      dependencies: [],
      derivedFrom: [],
      derivedTo: []
    };
  }

  // Private helper methods
  private async loadExistingData(): Promise<void> {
    // In a real implementation, this would load data from persistent storage
    console.log("Loading existing data from storage...");
  }

  private async updateDatasetStatistics(datasetId: string): Promise<void> {
    const dataset = await this.getDataset(datasetId);
    const files = await this.listFiles(datasetId);
    
    const statistics = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      fileTypeCounts: {} as Record<string, number>,
              modalityCounts: {
                [ModalityType.TEXT]: 0,
                [ModalityType.IMAGE]: 0,
                [ModalityType.AUDIO]: 0,
                [ModalityType.VIDEO]: 0,
                [ModalityType.DATA]: 0,
                [ModalityType.DOCUMENT]: 0,
                [ModalityType.CODE]: 0
              },
      lastIngested: new Date()
    };
    
    for (const file of files) {
      statistics.fileTypeCounts[file.fileType] = (statistics.fileTypeCounts[file.fileType] || 0) + 1;
      statistics.modalityCounts[file.modality] = (statistics.modalityCounts[file.modality] || 0) + 1;
    }
    
    await this.updateDataset(datasetId, { statistics });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateHash(input: string): string {
    // Simple hash function - in production, use crypto.createHash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private getFileTypeFromPath(path: string): FileType {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    
    // Simple mapping - in production, use the comprehensive mapping from repository-core
    const typeMap: Record<string, FileType> = {
      'parquet': FileType.PARQUET,
      'csv': FileType.CSV,
      'json': FileType.JSON,
      'jpg': FileType.IMAGE,
      'jpeg': FileType.IMAGE,
      'png': FileType.IMAGE,
      'mp4': FileType.VIDEO,
      'mp3': FileType.AUDIO,
      'pdf': FileType.PDF,
      'txt': FileType.TEXT,
      'py': FileType.CODE,
      'js': FileType.CODE,
      'ts': FileType.CODE
    };
    
    return typeMap[extension] || FileType.TEXT;
  }

  private getModalityFromFileType(fileType: FileType): ModalityType {
    const modalityMap: Partial<Record<FileType, ModalityType>> = {
      [FileType.PARQUET]: ModalityType.DATA,
      [FileType.CSV]: ModalityType.DATA,
      [FileType.JSON]: ModalityType.DATA,
      [FileType.IMAGE]: ModalityType.IMAGE,
      [FileType.VIDEO]: ModalityType.VIDEO,
      [FileType.AUDIO]: ModalityType.AUDIO,
      [FileType.PDF]: ModalityType.DOCUMENT,
      [FileType.TEXT]: ModalityType.TEXT,
      [FileType.CODE]: ModalityType.CODE
    };
    
    return modalityMap[fileType] || ModalityType.TEXT;
  }

  private getMimeTypeFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    
    const mimeMap: Record<string, string> = {
      'parquet': 'application/parquet',
      'csv': 'text/csv',
      'json': 'application/json',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'py': 'text/x-python',
      'js': 'text/javascript',
      'ts': 'text/typescript'
    };
    
    return mimeMap[extension] || 'application/octet-stream';
  }
}