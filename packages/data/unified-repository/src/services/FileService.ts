/**
 * File Service
 *
 * Service for managing files in the unified repository, integrating with
 * existing file processing capabilities and providing comprehensive file operations.
 */

import type { BaseAIService } from "reynard-ai-shared";
import type { ProcessingPipeline, ProcessingResult } from "reynard-file-processing";
import type {
  FileFilters,
  FileMetadata,
  FileType,
  IngestionError,
  IngestionRequest,
  IngestionResult,
  ModalityType,
  RepositoryFile,
} from "../types";
import { FileNotFoundError, RepositoryError } from "../types";
import { ParquetService } from "./ParquetService";

export class FileService extends BaseAIService {
  private processingPipeline: ProcessingPipeline;
  private parquetService: ParquetService;
  private initialized = false;

  constructor() {
    super({
      name: "file-service",
      dependencies: ["parquet-service"],
      startupPriority: 60,
      requiredPackages: ["reynard-file-processing"],
      autoStart: true,
      config: {
        maxFileSize: 1024 * 1024 * 1024, // 1GB
        supportedFormats: [
          "parquet",
          "arrow",
          "feather",
          "hdf5",
          "csv",
          "tsv",
          "json",
          "jsonl",
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "avif",
          "heic",
          "heif",
          "mp4",
          "avi",
          "mov",
          "mkv",
          "webm",
          "flv",
          "wmv",
          "mp3",
          "wav",
          "flac",
          "aac",
          "ogg",
          "m4a",
          "wma",
          "pdf",
          "html",
          "htm",
          "md",
          "markdown",
          "docx",
          "epub",
          "txt",
          "py",
          "js",
          "ts",
          "tsx",
          "jsx",
          "java",
          "cpp",
          "c",
          "h",
        ],
        enableThumbnails: true,
        enableMetadata: true,
        enableEmbeddings: true,
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize file processing pipeline
      const { FileProcessingPipeline } = await import("reynard-file-processing");
      this.processingPipeline = new FileProcessingPipeline({
        maxFileSize: this.config.maxFileSize,
        supportedExtensions: this.config.supportedFormats.map(ext => `.${ext}`),
      });

      // Initialize parquet service
      this.parquetService = new ParquetService();
      await this.parquetService.initialize();

      this.initialized = true;
      this.logger.info("FileService initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize FileService:", error);
      throw new RepositoryError("Failed to initialize FileService", "FILE_SERVICE_INIT_ERROR", error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.parquetService) {
      await this.parquetService.shutdown();
    }
    this.initialized = false;
    this.logger.info("FileService shutdown complete");
  }

  async healthCheck(): Promise<any> {
    return {
      status: this.initialized ? "healthy" : "unhealthy",
      processingPipeline: !!this.processingPipeline,
      parquetService: this.parquetService ? await this.parquetService.healthCheck() : null,
      lastCheck: new Date(),
    };
  }

  /**
   * Ingest files into a dataset
   */
  async ingestFiles(request: IngestionRequest): Promise<IngestionResult> {
    this.ensureInitialized();

    const startTime = Date.now();
    const errors: IngestionError[] = [];
    let filesProcessed = 0;
    let filesSkipped = 0;
    let totalSize = 0;
    let embeddingsGenerated = 0;
    let metadataExtracted = 0;
    let thumbnailsGenerated = 0;

    try {
      for (const file of request.files) {
        try {
          const result = await this.processFile(file, request.options);

          if (result.success) {
            filesProcessed++;
            totalSize += result.size || 0;
            if (result.embeddingsGenerated) embeddingsGenerated++;
            if (result.metadataExtracted) metadataExtracted++;
            if (result.thumbnailsGenerated) thumbnailsGenerated++;
          } else {
            filesSkipped++;
            errors.push({
              file: file.path,
              error: result.error || "Unknown error",
              code: result.errorCode || "PROCESSING_ERROR",
            });
          }
        } catch (error) {
          filesSkipped++;
          errors.push({
            file: file.path,
            error: error instanceof Error ? error.message : String(error),
            code: "PROCESSING_EXCEPTION",
          });
        }
      }

      const processingTime = Date.now() - startTime;

      return {
        success: errors.length === 0,
        filesProcessed,
        filesSkipped,
        errors,
        statistics: {
          totalSize,
          processingTime,
          embeddingsGenerated,
          metadataExtracted,
          thumbnailsGenerated,
        },
      };
    } catch (error) {
      this.logger.error("Failed to ingest files:", error);
      throw new RepositoryError("Failed to ingest files", "INGESTION_ERROR", error);
    }
  }

  /**
   * Process a single file
   */
  private async processFile(
    file: { path: string; metadata?: Partial<FileMetadata>; tags?: string[] },
    options?: any
  ): Promise<{
    success: boolean;
    size?: number;
    error?: string;
    errorCode?: string;
    embeddingsGenerated?: boolean;
    metadataExtracted?: boolean;
    thumbnailsGenerated?: boolean;
  }> {
    try {
      // Determine file type and modality
      const fileType = this.determineFileType(file.path);
      const modality = this.determineModality(fileType);

      // Process based on file type
      let processingResult: ProcessingResult;

      if (fileType === "parquet") {
        processingResult = await this.processParquetFile(file.path);
      } else {
        processingResult = await this.processingPipeline.processFile(file.path, {
          generateThumbnails: options?.generateThumbnails ?? true,
          extractMetadata: options?.extractMetadata ?? true,
          analyzeContent: options?.generateEmbeddings ?? true,
        });
      }

      return {
        success: true,
        size: processingResult.metadata?.size,
        embeddingsGenerated: !!processingResult.embeddings,
        metadataExtracted: !!processingResult.metadata,
        thumbnailsGenerated: !!processingResult.thumbnail,
      };
    } catch (error) {
      this.logger.error(`Failed to process file ${file.path}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        errorCode: "PROCESSING_ERROR",
      };
    }
  }

  /**
   * Process parquet file with specialized handling
   */
  private async processParquetFile(filePath: string): Promise<ProcessingResult> {
    try {
      const parquetInfo = await this.parquetService.processParquetFile(filePath);
      const metadata = await this.parquetService.createFileMetadata(parquetInfo);

      return {
        success: true,
        metadata: {
          ...metadata,
          size: parquetInfo.size,
          fileType: "parquet",
          modality: "data",
        },
        content: {
          schema: parquetInfo.schema,
          statistics: parquetInfo.statistics,
          rowCount: parquetInfo.rowCount,
          columnCount: parquetInfo.columnCount,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to process parquet file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFile(id: string): Promise<RepositoryFile> {
    this.ensureInitialized();

    try {
      // This would typically query the database
      // For now, return a mock implementation
      throw new Error("Database integration not yet implemented");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new FileNotFoundError(id);
      }
      throw new RepositoryError(`Failed to get file: ${id}`, "FILE_GET_ERROR", error);
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(id: string, updates: Partial<RepositoryFile>): Promise<RepositoryFile> {
    this.ensureInitialized();

    try {
      // This would typically update the database
      // For now, return a mock implementation
      throw new Error("Database integration not yet implemented");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new FileNotFoundError(id);
      }
      throw new RepositoryError(`Failed to update file: ${id}`, "FILE_UPDATE_ERROR", error);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      // This would typically delete from database and storage
      // For now, return a mock implementation
      throw new Error("Database integration not yet implemented");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new FileNotFoundError(id);
      }
      throw new RepositoryError(`Failed to delete file: ${id}`, "FILE_DELETE_ERROR", error);
    }
  }

  /**
   * List files in a dataset
   */
  async listFiles(datasetId: string, filters?: FileFilters): Promise<RepositoryFile[]> {
    this.ensureInitialized();

    try {
      // This would typically query the database
      // For now, return a mock implementation
      throw new Error("Database integration not yet implemented");
    } catch (error) {
      throw new RepositoryError(`Failed to list files for dataset: ${datasetId}`, "FILE_LIST_ERROR", error);
    }
  }

  /**
   * Get all files (for health checks and statistics)
   */
  async getAllFiles(): Promise<RepositoryFile[]> {
    this.ensureInitialized();

    try {
      // This would typically query the database
      // For now, return a mock implementation
      return [];
    } catch (error) {
      throw new RepositoryError("Failed to get all files", "FILE_GET_ALL_ERROR", error);
    }
  }

  /**
   * Bulk update files
   */
  async bulkUpdateFiles(
    datasetId: string,
    updates: Array<{ id: string; updates: Partial<RepositoryFile> }>
  ): Promise<RepositoryFile[]> {
    this.ensureInitialized();

    try {
      const results: RepositoryFile[] = [];

      for (const update of updates) {
        try {
          const updatedFile = await this.updateFile(update.id, update.updates);
          results.push(updatedFile);
        } catch (error) {
          this.logger.warn(`Failed to update file ${update.id}:`, error);
          // Continue with other updates
        }
      }

      return results;
    } catch (error) {
      throw new RepositoryError(
        `Failed to bulk update files for dataset: ${datasetId}`,
        "FILE_BULK_UPDATE_ERROR",
        error
      );
    }
  }

  /**
   * Determine file type from path
   */
  private determineFileType(path: string): FileType {
    const extension = path.split(".").pop()?.toLowerCase();

    const typeMap: Record<string, FileType> = {
      // Data formats
      parquet: "parquet",
      arrow: "arrow",
      feather: "feather",
      h5: "hdf5",
      hdf5: "hdf5",
      csv: "csv",
      tsv: "tsv",
      json: "json",
      jsonl: "jsonl",

      // Image formats
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      webp: "image",
      avif: "image",
      heic: "image",
      heif: "image",
      bmp: "image",
      tiff: "image",
      tif: "image",

      // Video formats
      mp4: "video",
      avi: "video",
      mov: "video",
      mkv: "video",
      webm: "video",
      flv: "video",
      wmv: "video",
      mpg: "video",
      mpeg: "video",

      // Audio formats
      mp3: "audio",
      wav: "audio",
      flac: "audio",
      aac: "audio",
      ogg: "audio",
      m4a: "audio",
      wma: "audio",

      // Document formats
      pdf: "pdf",
      html: "html",
      htm: "html",
      md: "markdown",
      markdown: "markdown",
      docx: "docx",
      epub: "epub",

      // Text formats
      txt: "text",

      // Code formats
      py: "code",
      js: "code",
      ts: "code",
      tsx: "code",
      jsx: "code",
      java: "code",
      cpp: "code",
      c: "code",
      h: "code",
      hpp: "code",
      cs: "code",
      php: "code",
      rb: "code",
      go: "code",
      rs: "code",
      swift: "code",
      kt: "code",
      scala: "code",
    };

    return typeMap[extension || ""] || "text";
  }

  /**
   * Determine modality from file type
   */
  private determineModality(fileType: FileType): ModalityType {
    const modalityMap: Record<FileType, ModalityType> = {
      parquet: "data",
      arrow: "data",
      feather: "data",
      hdf5: "data",
      csv: "data",
      tsv: "data",
      json: "data",
      jsonl: "data",

      image: "image",
      video: "video",
      audio: "audio",

      pdf: "document",
      html: "document",
      markdown: "document",
      docx: "document",
      epub: "document",

      text: "text",
      code: "code",
    };

    return modalityMap[fileType] || "text";
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError(
        "FileService not initialized. Call initialize() first.",
        "FILE_SERVICE_NOT_INITIALIZED"
      );
    }
  }
}
