/**
 * Unified Repository Service
 *
 * Main service for managing multimodal datasets and files in the Reynard ecosystem.
 * Provides a unified interface for file management, metadata handling, and parquet processing.
 */
import { RepositoryError } from "../types";
import { FileService } from "./FileService";
import { MetadataService } from "./MetadataService";
import { ParquetService } from "./ParquetService";
export class UnifiedRepository {
    constructor(config) {
        Object.defineProperty(this, "fileService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metadataService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "parquetService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "initialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.config = config;
        this.initializeServices();
    }
    initializeServices() {
        this.fileService = new FileService(this.config);
        this.metadataService = new MetadataService(this.config);
        this.parquetService = new ParquetService();
    }
    /**
     * Initialize the repository and all services
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            // Initialize services in dependency order
            await this.metadataService.initialize();
            await this.fileService.initialize();
            await this.parquetService.initialize();
            this.initialized = true;
        }
        catch (error) {
            throw new RepositoryError("Failed to initialize repository", "INITIALIZATION_ERROR", error);
        }
    }
    /**
     * Shutdown the repository and cleanup resources
     */
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        try {
            await Promise.all([this.fileService.shutdown(), this.metadataService.shutdown(), this.parquetService.shutdown()]);
            this.initialized = false;
        }
        catch (error) {
            throw new RepositoryError("Failed to shutdown repository", "SHUTDOWN_ERROR", error);
        }
    }
    /**
     * Get health status of all services
     */
    async getHealthStatus() {
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
    async uploadFile(file, datasetId, options) {
        this.ensureInitialized();
        return this.fileService.uploadFile(file, datasetId, options);
    }
    async getFile(fileId) {
        this.ensureInitialized();
        return this.fileService.getFile(fileId);
    }
    async deleteFile(fileId) {
        this.ensureInitialized();
        return this.fileService.deleteFile(fileId);
    }
    async listFiles(datasetId, options) {
        this.ensureInitialized();
        return this.fileService.listFiles(datasetId, options);
    }
    // ============================================================================
    // Metadata
    // ============================================================================
    async updateMetadata(fileId, metadata) {
        this.ensureInitialized();
        return this.metadataService.updateMetadata(fileId, metadata);
    }
    async getMetadata(fileId) {
        this.ensureInitialized();
        return this.metadataService.getMetadata(fileId);
    }
    // ============================================================================
    // Parquet Processing
    // ============================================================================
    async processParquetFile(filePath) {
        this.ensureInitialized();
        return this.parquetService.processParquetFile(filePath);
    }
    async queryParquetFile(filePath, options) {
        this.ensureInitialized();
        return this.parquetService.queryParquetFile(filePath, options);
    }
    // ============================================================================
    // Service Accessors
    // ============================================================================
    get file() {
        return this.fileService;
    }
    get metadata() {
        return this.metadataService;
    }
    get parquet() {
        return this.parquetService;
    }
    // ============================================================================
    // Private Methods
    // ============================================================================
    ensureInitialized() {
        if (!this.initialized) {
            throw new RepositoryError("Repository not initialized. Call initialize() first.", "NOT_INITIALIZED");
        }
    }
}
