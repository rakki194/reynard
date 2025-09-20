/**
 * Unified Repository Service
 *
 * Main service for managing multimodal datasets and files in the Reynard ecosystem.
 * Provides a unified interface for file management, metadata handling, and parquet processing.
 */

import type { FileMetadata, ListOptions, RepositoryConfig, RepositoryService, UploadOptions } from "../types";
import { RepositoryError } from "../types";
import { FileService } from "./FileService";
import { MetadataService } from "./MetadataService";
import { ParquetService } from "./ParquetService";

export class UnifiedRepository implements RepositoryService {
  private fileService: FileService;
  private metadataService: MetadataService;
  private parquetService: ParquetService;
  private config: RepositoryConfig;
  private initialized = false;

  constructor(config: RepositoryConfig) {
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    this.fileService = new FileService(this.config);
    this.metadataService = new MetadataService(this.config);
    this.parquetService = new ParquetService();
  }

  /**
   * Initialize the repository and all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize services in dependency order
      await this.metadataService.initialize();
      await this.fileService.initialize();
      await this.parquetService.initialize();

      this.initialized = true;
    } catch (error) {
      throw new RepositoryError("Failed to initialize repository", "INITIALIZATION_ERROR", error);
    }
  }

  /**
   * Shutdown the repository and cleanup resources
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await Promise.all([this.fileService.shutdown(), this.metadataService.shutdown(), this.parquetService.shutdown()]);

      this.initialized = false;
    } catch (error) {
      throw new RepositoryError("Failed to shutdown repository", "SHUTDOWN_ERROR", error);
    }
  }

  /**
   * Get health status of all services
   */
  async getHealthStatus(): Promise<any> {
    const services = {
      file: await this.fileService.healthCheck(),
      metadata: await this.metadataService.healthCheck(),
      parquet: await this.parquetService.healthCheck(),
    };

    return {
      status: this.initialized ? "healthy" : "unhealthy",
      services,
      lastCheck: new Date(),
    };
  }

  // ============================================================================
  // File Management
  // ============================================================================

  async uploadFile(file: File, datasetId: string, options?: UploadOptions): Promise<string> {
    this.ensureInitialized();
    return this.fileService.uploadFile(file, datasetId, options);
  }

  async getFile(fileId: string): Promise<FileMetadata> {
    this.ensureInitialized();
    return this.fileService.getFile(fileId);
  }

  async deleteFile(fileId: string): Promise<void> {
    this.ensureInitialized();
    return this.fileService.deleteFile(fileId);
  }

  async listFiles(datasetId: string, options?: ListOptions): Promise<FileMetadata[]> {
    this.ensureInitialized();
    return this.fileService.listFiles(datasetId, options);
  }

  // ============================================================================
  // Metadata
  // ============================================================================

  async updateMetadata(fileId: string, metadata: Partial<FileMetadata>): Promise<void> {
    this.ensureInitialized();
    return this.metadataService.updateMetadata(fileId, metadata);
  }

  async getMetadata(fileId: string): Promise<FileMetadata> {
    this.ensureInitialized();
    return this.metadataService.getMetadata(fileId);
  }

  // ============================================================================
  // Parquet Processing
  // ============================================================================

  async processParquetFile(filePath: string): Promise<any> {
    this.ensureInitialized();
    return this.parquetService.processParquetFile(filePath);
  }

  async queryParquetFile(filePath: string, options?: any): Promise<any> {
    this.ensureInitialized();
    return this.parquetService.queryParquetFile(filePath, options);
  }

  // ============================================================================
  // Service Accessors
  // ============================================================================

  get file(): FileService {
    return this.fileService;
  }

  get metadata(): MetadataService {
    return this.metadataService;
  }

  get parquet(): ParquetService {
    return this.parquetService;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError("Repository not initialized. Call initialize() first.", "NOT_INITIALIZED");
    }
  }
}
