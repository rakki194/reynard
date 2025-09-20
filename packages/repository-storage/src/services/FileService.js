/**
 * File Service
 *
 * Service for managing files in the unified repository, integrating with
 * existing file processing capabilities and providing comprehensive file operations.
 */
import { BaseAIService } from "reynard-ai-shared";
import { FileNotFoundError, RepositoryError } from "../types";
import { ParquetService } from "./ParquetService";
export class FileService extends BaseAIService {
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
        Object.defineProperty(this, "processingPipeline", {
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
        Object.defineProperty(this, "initialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    async initialize() {
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
        }
        catch (error) {
            this.logger.error("Failed to initialize FileService:", error);
            throw new RepositoryError("Failed to initialize FileService", "FILE_SERVICE_INIT_ERROR", error);
        }
    }
    async shutdown() {
        if (this.parquetService) {
            await this.parquetService.shutdown();
        }
        this.initialized = false;
        this.logger.info("FileService shutdown complete");
    }
    async healthCheck() {
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
    async ingestFiles(request) {
        this.ensureInitialized();
        const startTime = Date.now();
        const errors = [];
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
                        if (result.embeddingsGenerated)
                            embeddingsGenerated++;
                        if (result.metadataExtracted)
                            metadataExtracted++;
                        if (result.thumbnailsGenerated)
                            thumbnailsGenerated++;
                    }
                    else {
                        filesSkipped++;
                        errors.push({
                            file: file.path,
                            error: result.error || "Unknown error",
                            code: result.errorCode || "PROCESSING_ERROR",
                        });
                    }
                }
                catch (error) {
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
        }
        catch (error) {
            this.logger.error("Failed to ingest files:", error);
            throw new RepositoryError("Failed to ingest files", "INGESTION_ERROR", error);
        }
    }
    /**
     * Process a single file
     */
    async processFile(file, options) {
        try {
            // Determine file type and modality
            const fileType = this.determineFileType(file.path);
            const modality = this.determineModality(fileType);
            // Process based on file type
            let processingResult;
            if (fileType === "parquet") {
                processingResult = await this.processParquetFile(file.path);
            }
            else {
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
        }
        catch (error) {
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
    async processParquetFile(filePath) {
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
        }
        catch (error) {
            this.logger.error(`Failed to process parquet file ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Get file by ID
     */
    async getFile(id) {
        this.ensureInitialized();
        try {
            // This would typically query the database
            // For now, return a mock implementation
            throw new Error("Database integration not yet implemented");
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("not found")) {
                throw new FileNotFoundError(id);
            }
            throw new RepositoryError(`Failed to get file: ${id}`, "FILE_GET_ERROR", error);
        }
    }
    /**
     * Update file metadata
     */
    async updateFile(id, updates) {
        this.ensureInitialized();
        try {
            // This would typically update the database
            // For now, return a mock implementation
            throw new Error("Database integration not yet implemented");
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("not found")) {
                throw new FileNotFoundError(id);
            }
            throw new RepositoryError(`Failed to update file: ${id}`, "FILE_UPDATE_ERROR", error);
        }
    }
    /**
     * Delete file
     */
    async deleteFile(id) {
        this.ensureInitialized();
        try {
            // This would typically delete from database and storage
            // For now, return a mock implementation
            throw new Error("Database integration not yet implemented");
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("not found")) {
                throw new FileNotFoundError(id);
            }
            throw new RepositoryError(`Failed to delete file: ${id}`, "FILE_DELETE_ERROR", error);
        }
    }
    /**
     * List files in a dataset
     */
    async listFiles(datasetId, filters) {
        this.ensureInitialized();
        try {
            // This would typically query the database
            // For now, return a mock implementation
            throw new Error("Database integration not yet implemented");
        }
        catch (error) {
            throw new RepositoryError(`Failed to list files for dataset: ${datasetId}`, "FILE_LIST_ERROR", error);
        }
    }
    /**
     * Get all files (for health checks and statistics)
     */
    async getAllFiles() {
        this.ensureInitialized();
        try {
            // This would typically query the database
            // For now, return a mock implementation
            return [];
        }
        catch (error) {
            throw new RepositoryError("Failed to get all files", "FILE_GET_ALL_ERROR", error);
        }
    }
    /**
     * Bulk update files
     */
    async bulkUpdateFiles(datasetId, updates) {
        this.ensureInitialized();
        try {
            const results = [];
            for (const update of updates) {
                try {
                    const updatedFile = await this.updateFile(update.id, update.updates);
                    results.push(updatedFile);
                }
                catch (error) {
                    this.logger.warn(`Failed to update file ${update.id}:`, error);
                    // Continue with other updates
                }
            }
            return results;
        }
        catch (error) {
            throw new RepositoryError(`Failed to bulk update files for dataset: ${datasetId}`, "FILE_BULK_UPDATE_ERROR", error);
        }
    }
    /**
     * Determine file type from path
     */
    determineFileType(path) {
        const extension = path.split(".").pop()?.toLowerCase();
        const typeMap = {
            // Data formats
            parquet: FileType.PARQUET,
            arrow: FileType.ARROW,
            feather: FileType.FEATHER,
            h5: FileType.HDF5,
            hdf5: FileType.HDF5,
            csv: FileType.CSV,
            tsv: FileType.TSV,
            json: FileType.JSON,
            jsonl: FileType.JSONL,
            // Image formats
            jpg: FileType.IMAGE,
            jpeg: FileType.IMAGE,
            png: FileType.IMAGE,
            gif: FileType.IMAGE,
            webp: FileType.IMAGE,
            avif: FileType.IMAGE,
            heic: FileType.IMAGE,
            heif: FileType.IMAGE,
            bmp: FileType.IMAGE,
            tiff: FileType.IMAGE,
            tif: FileType.IMAGE,
            // Video formats
            mp4: FileType.VIDEO,
            avi: FileType.VIDEO,
            mov: FileType.VIDEO,
            mkv: FileType.VIDEO,
            webm: FileType.VIDEO,
            flv: FileType.VIDEO,
            wmv: FileType.VIDEO,
            mpg: FileType.VIDEO,
            mpeg: FileType.VIDEO,
            // Audio formats
            mp3: FileType.AUDIO,
            wav: FileType.AUDIO,
            flac: FileType.AUDIO,
            aac: FileType.AUDIO,
            ogg: FileType.AUDIO,
            m4a: FileType.AUDIO,
            wma: FileType.AUDIO,
            // Document formats
            pdf: FileType.PDF,
            html: FileType.HTML,
            htm: FileType.HTML,
            md: FileType.MARKDOWN,
            markdown: FileType.MARKDOWN,
            docx: FileType.DOCX,
            epub: FileType.EPUB,
            // Text formats
            txt: FileType.TEXT,
            // Code formats
            py: FileType.CODE,
            js: FileType.CODE,
            ts: FileType.CODE,
            tsx: FileType.CODE,
            jsx: FileType.CODE,
            java: FileType.CODE,
            cpp: FileType.CODE,
            c: FileType.CODE,
            h: FileType.CODE,
            hpp: FileType.CODE,
            cs: FileType.CODE,
            php: FileType.CODE,
            rb: FileType.CODE,
            go: FileType.CODE,
            rs: FileType.CODE,
            swift: FileType.CODE,
            kt: FileType.CODE,
            scala: FileType.CODE,
        };
        return typeMap[extension || ""] || FileType.TEXT;
    }
    /**
     * Determine modality from file type
     */
    determineModality(fileType) {
        const modalityMap = {
            [FileType.PARQUET]: ModalityType.DATA,
            [FileType.ARROW]: ModalityType.DATA,
            [FileType.FEATHER]: ModalityType.DATA,
            [FileType.HDF5]: ModalityType.DATA,
            [FileType.CSV]: ModalityType.DATA,
            [FileType.TSV]: ModalityType.DATA,
            [FileType.JSON]: ModalityType.DATA,
            [FileType.JSONL]: ModalityType.DATA,
            [FileType.IMAGE]: ModalityType.IMAGE,
            [FileType.VIDEO]: ModalityType.VIDEO,
            [FileType.AUDIO]: ModalityType.AUDIO,
            [FileType.PDF]: ModalityType.DOCUMENT,
            [FileType.HTML]: ModalityType.DOCUMENT,
            [FileType.MARKDOWN]: ModalityType.DOCUMENT,
            [FileType.DOCX]: ModalityType.DOCUMENT,
            [FileType.EPUB]: ModalityType.DOCUMENT,
            [FileType.TEXT]: ModalityType.TEXT,
            [FileType.CODE]: ModalityType.CODE,
        };
        return modalityMap[fileType] || ModalityType.TEXT;
    }
    /**
     * Ensure service is initialized
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new RepositoryError("FileService not initialized. Call initialize() first.", "FILE_SERVICE_NOT_INITIALIZED");
        }
    }
}
