/**
 * Unified Repository API
 *
 * REST API layer for the unified repository system.
 * Provides comprehensive endpoints for dataset management, file operations, and search.
 */

import type { BaseAIService } from "reynard-ai-shared";
import type { Repository } from "../services/Repository";
import { RepositoryError } from "../types";

export interface APIConfig {
  port: number;
  host: string;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  authentication: {
    enabled: boolean;
    secret: string;
    expiresIn: string;
  };
  validation: {
    enabled: boolean;
    strict: boolean;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class RepositoryAPI extends BaseAIService {
  private repository: Repository;
  private initialized = false;
  private server: any;

  constructor() {
    super({
      name: "unified-repository-api",
      dependencies: ["unified-repository"],
      startupPriority: 100,
      requiredPackages: ["express", "cors", "helmet", "express-rate-limit"],
      autoStart: true,
      config: {
        port: 3000,
        host: "0.0.0.0",
        cors: {
          origin: ["http://localhost:3000", "http://localhost:5173"],
          credentials: true,
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100, // limit each IP to 100 requests per windowMs
        },
        authentication: {
          enabled: false,
          secret: "your-secret-key",
          expiresIn: "24h",
        },
        validation: {
          enabled: true,
          strict: true,
        },
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize repository
      this.repository = new Repository();
      await this.repository.initialize();

      // Initialize Express server
      await this.initializeServer();

      this.initialized = true;
      this.logger.info("RepositoryAPI initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize RepositoryAPI:", error);
      throw new RepositoryError("Failed to initialize RepositoryAPI", "API_INIT_ERROR", error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
    if (this.repository) {
      await this.repository.shutdown();
    }
    this.initialized = false;
    this.logger.info("RepositoryAPI shutdown complete");
  }

  async healthCheck(): Promise<any> {
    return {
      status: this.initialized ? "healthy" : "unhealthy",
      repository: this.repository ? await this.repository.healthCheck() : null,
      server: !!this.server,
      lastCheck: new Date(),
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Initialize Express server with middleware and routes
   */
  private async initializeServer(): Promise<void> {
    try {
      const express = await import("express");
      const cors = await import("cors");
      const helmet = await import("helmet");
      const rateLimit = await import("express-rate-limit");

      const app = express.default();

      // Security middleware
      app.use(helmet.default());
      app.use(cors.default(this.config.cors));

      // Rate limiting
      app.use(rateLimit.default(this.config.rateLimit));

      // Body parsing
      app.use(express.json({ limit: "50mb" }));
      app.use(express.urlencoded({ extended: true, limit: "50mb" }));

      // Request logging
      app.use(this.requestLogger.bind(this));

      // API routes
      this.setupRoutes(app);

      // Error handling
      app.use(this.errorHandler.bind(this));

      // 404 handler
      app.use(this.notFoundHandler.bind(this));

      // Start server
      this.server = app.listen(this.config.port, this.config.host, () => {
        this.logger.info(`Unified Repository API server running on ${this.config.host}:${this.config.port}`);
      });
    } catch (error) {
      this.logger.error("Failed to initialize Express server:", error);
      throw error;
    }
  }

  /**
   * Setup API routes
   */
  private setupRoutes(app: any): void {
    // Health check
    app.get("/health", this.healthCheckHandler.bind(this));

    // API versioning
    app.use("/api/v1", this.createAPIRouter());

    // Root endpoint
    app.get("/", (req: any, res: any) => {
      res.json({
        success: true,
        data: {
          name: "Unified Repository API",
          version: "1.0.0",
          description: "Comprehensive API for multimodal dataset management",
          endpoints: {
            health: "/health",
            api: "/api/v1",
            docs: "/api/v1/docs",
          },
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        },
      });
    });
  }

  /**
   * Create API router with all endpoints
   */
  private createAPIRouter(): any {
    const express = require("express");
    const router = express.Router();

    // Dataset endpoints
    router.get("/datasets", this.listDatasetsHandler.bind(this));
    router.post("/datasets", this.createDatasetHandler.bind(this));
    router.get("/datasets/:id", this.getDatasetHandler.bind(this));
    router.put("/datasets/:id", this.updateDatasetHandler.bind(this));
    router.delete("/datasets/:id", this.deleteDatasetHandler.bind(this));
    router.get("/datasets/:id/statistics", this.getDatasetStatisticsHandler.bind(this));
    router.get("/datasets/:id/files", this.getDatasetFilesHandler.bind(this));
    router.post("/datasets/:id/files", this.addFilesToDatasetHandler.bind(this));
    router.delete("/datasets/:id/files", this.removeFilesFromDatasetHandler.bind(this));

    // Version endpoints
    router.get("/datasets/:id/versions", this.listVersionsHandler.bind(this));
    router.post("/datasets/:id/versions", this.createVersionHandler.bind(this));
    router.get("/datasets/:id/versions/:version", this.getVersionHandler.bind(this));
    router.post("/datasets/:id/versions/:version/rollback", this.rollbackVersionHandler.bind(this));

    // File endpoints
    router.get("/files", this.listFilesHandler.bind(this));
    router.get("/files/:id", this.getFileHandler.bind(this));
    router.put("/files/:id", this.updateFileHandler.bind(this));
    router.delete("/files/:id", this.deleteFileHandler.bind(this));
    router.post("/files/ingest", this.ingestFilesHandler.bind(this));

    // Search endpoints
    router.post("/search", this.searchHandler.bind(this));
    router.post("/search/vector", this.vectorSearchHandler.bind(this));
    router.post("/search/hybrid", this.hybridSearchHandler.bind(this));
    router.post("/search/multimodal", this.multimodalSearchHandler.bind(this));
    router.get("/search/suggestions", this.getSearchSuggestionsHandler.bind(this));

    // Embedding endpoints
    router.post("/embeddings/generate", this.generateEmbeddingHandler.bind(this));
    router.post("/embeddings/batch", this.generateBatchEmbeddingsHandler.bind(this));
    router.get("/embeddings/:fileId", this.getEmbeddingHandler.bind(this));
    router.delete("/embeddings/:fileId", this.deleteEmbeddingHandler.bind(this));

    // Metadata endpoints
    router.post("/metadata/extract", this.extractMetadataHandler.bind(this));
    router.get("/metadata/:fileId", this.getMetadataHandler.bind(this));

    // Parquet endpoints
    router.post("/parquet/process", this.processParquetHandler.bind(this));
    router.post("/parquet/query", this.queryParquetHandler.bind(this));
    router.post("/parquet/validate", this.validateParquetHandler.bind(this));

    return router;
  }

  // ============================================================================
  // Request Handlers
  // ============================================================================

  private async healthCheckHandler(req: any, res: any): Promise<void> {
    try {
      const health = await this.healthCheck();
      res.json({
        success: true,
        data: health,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        },
      });
    } catch (error) {
      res.status(500).json(this.createErrorResponse("HEALTH_CHECK_ERROR", "Health check failed", error));
    }
  }

  private async listDatasetsHandler(req: any, res: any): Promise<void> {
    try {
      const filters = this.parseQueryFilters(req.query);
      const datasets = await this.repository.listDatasets(filters);

      res.json(
        this.createSuccessResponse(datasets, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("DATASET_LIST_ERROR", "Failed to list datasets", error));
    }
  }

  private async createDatasetHandler(req: any, res: any): Promise<void> {
    try {
      const { name, description, tags, metadata, version, status } = req.body;

      if (!name) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "Dataset name is required"));
        return;
      }

      const dataset = await this.repository.createDataset(name, {
        description,
        tags,
        metadata,
        version,
        status,
      });

      res.status(201).json(
        this.createSuccessResponse(dataset, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("DATASET_CREATION_ERROR", "Failed to create dataset", error));
    }
  }

  private async getDatasetHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const dataset = await this.repository.getDataset(id);

      res.json(
        this.createSuccessResponse(dataset, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json(this.createErrorResponse("DATASET_NOT_FOUND", "Dataset not found"));
      } else {
        res.status(500).json(this.createErrorResponse("DATASET_GET_ERROR", "Failed to get dataset", error));
      }
    }
  }

  private async updateDatasetHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const dataset = await this.repository.updateDataset(id, updates);

      res.json(
        this.createSuccessResponse(dataset, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json(this.createErrorResponse("DATASET_NOT_FOUND", "Dataset not found"));
      } else {
        res.status(500).json(this.createErrorResponse("DATASET_UPDATE_ERROR", "Failed to update dataset", error));
      }
    }
  }

  private async deleteDatasetHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      await this.repository.deleteDataset(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json(this.createErrorResponse("DATASET_NOT_FOUND", "Dataset not found"));
      } else {
        res.status(500).json(this.createErrorResponse("DATASET_DELETE_ERROR", "Failed to delete dataset", error));
      }
    }
  }

  private async getDatasetStatisticsHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const statistics = await this.repository.getDatasetStatistics(id);

      res.json(
        this.createSuccessResponse(statistics, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("DATASET_STATISTICS_ERROR", "Failed to get dataset statistics", error));
    }
  }

  private async getDatasetFilesHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const filters = this.parseQueryFilters(req.query);
      const files = await this.repository.listFiles(id, filters);

      res.json(
        this.createSuccessResponse(files, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("DATASET_FILES_ERROR", "Failed to get dataset files", error));
    }
  }

  private async addFilesToDatasetHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { fileIds } = req.body;

      if (!Array.isArray(fileIds)) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "fileIds must be an array"));
        return;
      }

      const files = await this.repository.addFilesToDataset(id, fileIds);

      res.json(
        this.createSuccessResponse(files, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("DATASET_ADD_FILES_ERROR", "Failed to add files to dataset", error));
    }
  }

  private async removeFilesFromDatasetHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { fileIds } = req.body;

      if (!Array.isArray(fileIds)) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "fileIds must be an array"));
        return;
      }

      await this.repository.removeFilesFromDataset(id, fileIds);

      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("DATASET_REMOVE_FILES_ERROR", "Failed to remove files from dataset", error));
    }
  }

  // ============================================================================
  // Search Handlers
  // ============================================================================

  private async searchHandler(req: any, res: any): Promise<void> {
    try {
      const { query, options } = req.body;

      if (!query) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "Search query is required"));
        return;
      }

      const results = await this.repository.search({ query, ...options });

      res.json(
        this.createSuccessResponse(results, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("SEARCH_ERROR", "Search failed", error));
    }
  }

  private async vectorSearchHandler(req: any, res: any): Promise<void> {
    try {
      const { query, options } = req.body;

      if (!query) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "Search query is required"));
        return;
      }

      const results = await this.repository.vectorSearch(query, options);

      res.json(
        this.createSuccessResponse(results, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("VECTOR_SEARCH_ERROR", "Vector search failed", error));
    }
  }

  private async hybridSearchHandler(req: any, res: any): Promise<void> {
    try {
      const { query, options } = req.body;

      if (!query) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "Search query is required"));
        return;
      }

      const results = await this.repository.hybridSearch(query, options);

      res.json(
        this.createSuccessResponse(results, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("HYBRID_SEARCH_ERROR", "Hybrid search failed", error));
    }
  }

  private async multimodalSearchHandler(req: any, res: any): Promise<void> {
    try {
      const { query, modalities, options } = req.body;

      if (!query || !modalities || !Array.isArray(modalities)) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "Query and modalities array are required"));
        return;
      }

      const results = await this.repository.multimodalSearch(query, modalities, options);

      res.json(
        this.createSuccessResponse(results, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("MULTIMODAL_SEARCH_ERROR", "Multimodal search failed", error));
    }
  }

  private async getSearchSuggestionsHandler(req: any, res: any): Promise<void> {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "Query parameter 'q' is required"));
        return;
      }

      const suggestions = await this.repository.getSearchSuggestions(query, parseInt(limit));

      res.json(
        this.createSuccessResponse(suggestions, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("SEARCH_SUGGESTIONS_ERROR", "Failed to get search suggestions", error));
    }
  }

  // ============================================================================
  // File Handlers
  // ============================================================================

  private async listFilesHandler(req: any, res: any): Promise<void> {
    try {
      const filters = this.parseQueryFilters(req.query);
      const files = await this.repository.listFiles("", filters);

      res.json(
        this.createSuccessResponse(files, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("FILE_LIST_ERROR", "Failed to list files", error));
    }
  }

  private async getFileHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const file = await this.repository.getFile(id);

      res.json(
        this.createSuccessResponse(file, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json(this.createErrorResponse("FILE_NOT_FOUND", "File not found"));
      } else {
        res.status(500).json(this.createErrorResponse("FILE_GET_ERROR", "Failed to get file", error));
      }
    }
  }

  private async updateFileHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const file = await this.repository.updateFile(id, updates);

      res.json(
        this.createSuccessResponse(file, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json(this.createErrorResponse("FILE_NOT_FOUND", "File not found"));
      } else {
        res.status(500).json(this.createErrorResponse("FILE_UPDATE_ERROR", "Failed to update file", error));
      }
    }
  }

  private async deleteFileHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      await this.repository.deleteFile(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json(this.createErrorResponse("FILE_NOT_FOUND", "File not found"));
      } else {
        res.status(500).json(this.createErrorResponse("FILE_DELETE_ERROR", "Failed to delete file", error));
      }
    }
  }

  private async ingestFilesHandler(req: any, res: any): Promise<void> {
    try {
      const { datasetId, files, options } = req.body;

      if (!datasetId || !files || !Array.isArray(files)) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "datasetId and files array are required"));
        return;
      }

      const result = await this.repository.ingestFiles({
        datasetId,
        files,
        options,
      });

      res.status(201).json(
        this.createSuccessResponse(result, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("INGESTION_ERROR", "File ingestion failed", error));
    }
  }

  // ============================================================================
  // Version Handlers
  // ============================================================================

  private async listVersionsHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const versions = await this.repository.listVersions(id);

      res.json(
        this.createSuccessResponse(versions, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("VERSION_LIST_ERROR", "Failed to list versions", error));
    }
  }

  private async createVersionHandler(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const versionData = req.body;

      const version = await this.repository.createVersion(id, versionData);

      res.status(201).json(
        this.createSuccessResponse(version, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("VERSION_CREATION_ERROR", "Failed to create version", error));
    }
  }

  private async getVersionHandler(req: any, res: any): Promise<void> {
    try {
      const { id, version } = req.params;
      const versionData = await this.repository.getVersion(id, version);

      res.json(
        this.createSuccessResponse(versionData, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json(this.createErrorResponse("VERSION_NOT_FOUND", "Version not found"));
      } else {
        res.status(500).json(this.createErrorResponse("VERSION_GET_ERROR", "Failed to get version", error));
      }
    }
  }

  private async rollbackVersionHandler(req: any, res: any): Promise<void> {
    try {
      const { id, version } = req.params;
      const { createNewVersion = true } = req.body;

      const rollbackVersion = await this.repository.rollbackToVersion(id, version, createNewVersion);

      res.json(
        this.createSuccessResponse(rollbackVersion, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("VERSION_ROLLBACK_ERROR", "Failed to rollback version", error));
    }
  }

  // ============================================================================
  // Embedding Handlers
  // ============================================================================

  private async generateEmbeddingHandler(req: any, res: any): Promise<void> {
    try {
      const { fileId, modality, content, options } = req.body;

      if (!fileId || !modality || !content) {
        res
          .status(400)
          .json(this.createErrorResponse("VALIDATION_ERROR", "fileId, modality, and content are required"));
        return;
      }

      const result = await this.repository.generateEmbedding({
        fileId,
        modality,
        content,
        options,
      });

      res.json(
        this.createSuccessResponse(result, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("EMBEDDING_GENERATION_ERROR", "Failed to generate embedding", error));
    }
  }

  private async generateBatchEmbeddingsHandler(req: any, res: any): Promise<void> {
    try {
      const { requests, options } = req.body;

      if (!requests || !Array.isArray(requests)) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "requests array is required"));
        return;
      }

      const result = await this.repository.generateBatchEmbeddings({
        requests,
        options,
      });

      res.json(
        this.createSuccessResponse(result, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("BATCH_EMBEDDING_ERROR", "Failed to generate batch embeddings", error));
    }
  }

  private async getEmbeddingHandler(req: any, res: any): Promise<void> {
    try {
      const { fileId } = req.params;
      const { modality } = req.query;

      if (!modality) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "modality query parameter is required"));
        return;
      }

      const embedding = await this.repository.getEmbedding(fileId, modality);

      res.json(
        this.createSuccessResponse(embedding, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("EMBEDDING_GET_ERROR", "Failed to get embedding", error));
    }
  }

  private async deleteEmbeddingHandler(req: any, res: any): Promise<void> {
    try {
      const { fileId } = req.params;
      const { modality } = req.query;

      if (!modality) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "modality query parameter is required"));
        return;
      }

      await this.repository.deleteEmbedding(fileId, modality);

      res.status(204).send();
    } catch (error) {
      res.status(500).json(this.createErrorResponse("EMBEDDING_DELETE_ERROR", "Failed to delete embedding", error));
    }
  }

  // ============================================================================
  // Metadata Handlers
  // ============================================================================

  private async extractMetadataHandler(req: any, res: any): Promise<void> {
    try {
      const { filePath, options } = req.body;

      if (!filePath) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "filePath is required"));
        return;
      }

      const metadata = await this.repository.extractMetadata(filePath, options);

      res.json(
        this.createSuccessResponse(metadata, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("METADATA_EXTRACTION_ERROR", "Failed to extract metadata", error));
    }
  }

  private async getMetadataHandler(req: any, res: any): Promise<void> {
    try {
      const { fileId } = req.params;
      const metadata = await this.repository.getMetadata(fileId);

      res.json(
        this.createSuccessResponse(metadata, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("METADATA_GET_ERROR", "Failed to get metadata", error));
    }
  }

  // ============================================================================
  // Parquet Handlers
  // ============================================================================

  private async processParquetHandler(req: any, res: any): Promise<void> {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "filePath is required"));
        return;
      }

      const result = await this.repository.processParquetFile(filePath);

      res.json(
        this.createSuccessResponse(result, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("PARQUET_PROCESSING_ERROR", "Failed to process parquet file", error));
    }
  }

  private async queryParquetHandler(req: any, res: any): Promise<void> {
    try {
      const { filePath, options } = req.body;

      if (!filePath) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "filePath is required"));
        return;
      }

      const result = await this.repository.queryParquetFile(filePath, options);

      res.json(
        this.createSuccessResponse(result, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res.status(500).json(this.createErrorResponse("PARQUET_QUERY_ERROR", "Failed to query parquet file", error));
    }
  }

  private async validateParquetHandler(req: any, res: any): Promise<void> {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        res.status(400).json(this.createErrorResponse("VALIDATION_ERROR", "filePath is required"));
        return;
      }

      const result = await this.repository.validateParquetFile(filePath);

      res.json(
        this.createSuccessResponse(result, {
          timestamp: new Date().toISOString(),
          requestId: req.id || "unknown",
          version: "1.0.0",
        })
      );
    } catch (error) {
      res
        .status(500)
        .json(this.createErrorResponse("PARQUET_VALIDATION_ERROR", "Failed to validate parquet file", error));
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private requestLogger(req: any, res: any, next: any): void {
    req.id = this.generateRequestId();
    this.logger.info(`${req.method} ${req.path} - ${req.id}`);
    next();
  }

  private errorHandler(err: any, req: any, res: any, next: any): void {
    this.logger.error(`Error in ${req.method} ${req.path}:`, err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json(this.createErrorResponse("INTERNAL_SERVER_ERROR", "Internal server error", err));
  }

  private notFoundHandler(req: any, res: any): void {
    res.status(404).json(this.createErrorResponse("NOT_FOUND", `Route ${req.method} ${req.path} not found`));
  }

  private createSuccessResponse<T>(data: T, metadata: any): APIResponse<T> {
    return {
      success: true,
      data,
      metadata,
    };
  }

  private createErrorResponse(code: string, message: string, details?: any): APIResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: "unknown",
        version: "1.0.0",
      },
    };
  }

  private parseQueryFilters(query: any): any {
    // Parse query parameters into filter objects
    const filters: any = {};

    if (query.tags) {
      filters.tags = Array.isArray(query.tags) ? query.tags : [query.tags];
    }

    if (query.status) {
      filters.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      filters.dateRange = {
        from: query.dateFrom ? new Date(query.dateFrom) : undefined,
        to: query.dateTo ? new Date(query.dateTo) : undefined,
      };
    }

    if (query.fileTypes) {
      filters.fileTypes = Array.isArray(query.fileTypes) ? query.fileTypes : [query.fileTypes];
    }

    if (query.modalities) {
      filters.modalities = Array.isArray(query.modalities) ? query.modalities : [query.modalities];
    }

    return filters;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError("RepositoryAPI not initialized. Call initialize() first.", "API_NOT_INITIALIZED");
    }
  }
}
