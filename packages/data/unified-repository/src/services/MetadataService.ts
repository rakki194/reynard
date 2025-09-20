/**
 * Metadata Service
 *
 * Comprehensive metadata extraction service for all file types and modalities.
 * Integrates with existing file processing capabilities and provides unified metadata management.
 */

import type { BaseAIService } from "reynard-ai-shared";
import { getFileTypeFromExtension, getMimeTypeFromExtension, getModalityFromFileType } from "../constants";
import type { ColumnStatistics, DataSchema, FileType, ModalityType } from "../types";
import { RepositoryError } from "../types";

export interface MetadataExtractionOptions {
  extractExif?: boolean;
  extractContent?: boolean;
  extractSchema?: boolean;
  extractStatistics?: boolean;
  extractThumbnails?: boolean;
  maxFileSize?: number;
  timeout?: number;
}

export interface ExtractedMetadata {
  basic: BasicMetadata;
  technical: TechnicalMetadata;
  content?: ContentMetadata;
  schema?: DataSchema;
  statistics?: ColumnStatistics[];
  custom: Record<string, any>;
}

export interface BasicMetadata {
  title?: string;
  description?: string;
  author?: string;
  language?: string;
  encoding?: string;
  tags?: string[];
  keywords?: string[];
}

export interface TechnicalMetadata {
  mimeType: string;
  fileType: FileType;
  modality: ModalityType;
  size: number;
  lastModified: Date;
  checksum: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  pageCount?: number;
  wordCount?: number;
  rowCount?: number;
  columnCount?: number;
}

export interface ContentMetadata {
  text?: string;
  summary?: string;
  language?: string;
  topics?: string[];
  entities?: Array<{ name: string; type: string; confidence: number }>;
  sentiment?: { score: number; label: string };
  readability?: { score: number; level: string };
}

export class MetadataService extends BaseAIService {
  private initialized = false;
  private processingPipeline: any;

  constructor() {
    super({
      name: "metadata-service",
      dependencies: [],
      startupPriority: 70,
      requiredPackages: ["reynard-file-processing"],
      autoStart: true,
      config: {
        maxFileSize: 1024 * 1024 * 1024, // 1GB
        enableExif: true,
        enableContentAnalysis: true,
        enableSchemaInference: true,
        enableStatistics: true,
        timeout: 30000, // 30 seconds
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize file processing pipeline for metadata extraction
      const { FileProcessingPipeline } = await import("reynard-file-processing");
      this.processingPipeline = new FileProcessingPipeline({
        maxFileSize: this.config.maxFileSize,
        enableMetadata: true,
        enableThumbnails: false, // We'll handle thumbnails separately
        enableEmbeddings: false, // We'll handle embeddings separately
      });

      this.initialized = true;
      this.logger.info("MetadataService initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize MetadataService:", error);
      throw new RepositoryError("Failed to initialize MetadataService", "METADATA_SERVICE_INIT_ERROR", error);
    }
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    this.logger.info("MetadataService shutdown complete");
  }

  async healthCheck(): Promise<any> {
    return {
      status: this.initialized ? "healthy" : "unhealthy",
      processingPipeline: !!this.processingPipeline,
      lastCheck: new Date(),
    };
  }

  /**
   * Extract comprehensive metadata from a file
   */
  async extractMetadata(filePath: string, options: MetadataExtractionOptions = {}): Promise<ExtractedMetadata> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();

      // Get basic file information
      const basicInfo = await this.getBasicFileInfo(filePath);

      // Extract basic metadata
      const basic = await this.extractBasicMetadata(filePath, basicInfo);

      // Extract technical metadata
      const technical = await this.extractTechnicalMetadata(filePath, basicInfo);

      // Extract content metadata if requested
      let content: ContentMetadata | undefined;
      if (options.extractContent && this.shouldExtractContent(technical.modality)) {
        content = await this.extractContentMetadata(filePath, technical);
      }

      // Extract schema for structured data
      let schema: DataSchema | undefined;
      if (options.extractSchema && technical.modality === "data") {
        schema = await this.extractDataSchema(filePath, technical);
      }

      // Extract statistics for data files
      let statistics: ColumnStatistics[] | undefined;
      if (options.extractStatistics && technical.modality === "data") {
        statistics = await this.extractColumnStatistics(filePath, schema);
      }

      // Extract custom metadata based on file type
      const custom = await this.extractCustomMetadata(filePath, technical);

      const processingTime = Date.now() - startTime;

      this.logger.info(`Extracted metadata from ${filePath} in ${processingTime}ms`);

      return {
        basic,
        technical,
        content,
        schema,
        statistics,
        custom: {
          ...custom,
          processingTime,
          extractedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to extract metadata from ${filePath}:`, error);
      throw new RepositoryError(`Failed to extract metadata: ${filePath}`, "METADATA_EXTRACTION_ERROR", error);
    }
  }

  /**
   * Get basic file information
   */
  private async getBasicFileInfo(filePath: string): Promise<{
    size: number;
    lastModified: Date;
    extension: string;
    checksum: string;
  }> {
    try {
      const fs = await import("fs/promises");
      const crypto = await import("crypto");

      const stats = await fs.stat(filePath);
      const extension = filePath.split(".").pop()?.toLowerCase() || "";

      // Calculate checksum
      const fileBuffer = await fs.readFile(filePath);
      const checksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");

      return {
        size: stats.size,
        lastModified: stats.mtime,
        extension,
        checksum,
      };
    } catch (error) {
      this.logger.warn(`Failed to get basic file info for ${filePath}:`, error);
      return {
        size: 0,
        lastModified: new Date(),
        extension: "",
        checksum: "",
      };
    }
  }

  /**
   * Extract basic metadata (title, description, author, etc.)
   */
  private async extractBasicMetadata(filePath: string, basicInfo: any): Promise<BasicMetadata> {
    const basic: BasicMetadata = {};

    try {
      // Extract title from filename
      const fileName = filePath.split("/").pop() || "";
      basic.title = fileName.replace(/\.[^/.]+$/, ""); // Remove extension

      // For certain file types, try to extract more metadata
      const fileType = getFileTypeFromExtension(basicInfo.extension);

      if (fileType === "pdf") {
        const pdfMetadata = await this.extractPDFMetadata(filePath);
        basic.title = pdfMetadata.title || basic.title;
        basic.author = pdfMetadata.author;
        basic.description = pdfMetadata.subject;
        basic.keywords = pdfMetadata.keywords;
      } else if (fileType === "image") {
        const imageMetadata = await this.extractImageMetadata(filePath);
        basic.description = imageMetadata.description;
        basic.keywords = imageMetadata.keywords;
      } else if (fileType === "markdown" || fileType === "text") {
        const textMetadata = await this.extractTextMetadata(filePath);
        basic.title = textMetadata.title || basic.title;
        basic.description = textMetadata.description;
        basic.language = textMetadata.language;
      }
    } catch (error) {
      this.logger.warn(`Failed to extract basic metadata from ${filePath}:`, error);
    }

    return basic;
  }

  /**
   * Extract technical metadata
   */
  private async extractTechnicalMetadata(filePath: string, basicInfo: any): Promise<TechnicalMetadata> {
    const fileType = getFileTypeFromExtension(basicInfo.extension);
    const modality = getModalityFromFileType(fileType);
    const mimeType = getMimeTypeFromExtension(basicInfo.extension);

    const technical: TechnicalMetadata = {
      mimeType,
      fileType,
      modality,
      size: basicInfo.size,
      lastModified: basicInfo.lastModified,
      checksum: basicInfo.checksum,
    };

    try {
      // Extract modality-specific technical metadata
      if (modality === "image") {
        const imageInfo = await this.extractImageTechnicalMetadata(filePath);
        technical.dimensions = imageInfo.dimensions;
      } else if (modality === "video") {
        const videoInfo = await this.extractVideoTechnicalMetadata(filePath);
        technical.dimensions = videoInfo.dimensions;
        technical.duration = videoInfo.duration;
        technical.bitrate = videoInfo.bitrate;
      } else if (modality === "audio") {
        const audioInfo = await this.extractAudioTechnicalMetadata(filePath);
        technical.duration = audioInfo.duration;
        technical.bitrate = audioInfo.bitrate;
        technical.sampleRate = audioInfo.sampleRate;
      } else if (modality === "document") {
        const docInfo = await this.extractDocumentTechnicalMetadata(filePath);
        technical.pageCount = docInfo.pageCount;
        technical.wordCount = docInfo.wordCount;
      } else if (modality === "data") {
        const dataInfo = await this.extractDataTechnicalMetadata(filePath);
        technical.rowCount = dataInfo.rowCount;
        technical.columnCount = dataInfo.columnCount;
      }
    } catch (error) {
      this.logger.warn(`Failed to extract technical metadata from ${filePath}:`, error);
    }

    return technical;
  }

  /**
   * Extract content metadata
   */
  private async extractContentMetadata(filePath: string, technical: TechnicalMetadata): Promise<ContentMetadata> {
    const content: ContentMetadata = {};

    try {
      if (technical.modality === "text" || technical.modality === "document") {
        const textContent = await this.extractTextContent(filePath);
        content.text = textContent;
        content.summary = await this.generateSummary(textContent);
        content.language = await this.detectLanguage(textContent);
        content.topics = await this.extractTopics(textContent);
        content.entities = await this.extractEntities(textContent);
        content.sentiment = await this.analyzeSentiment(textContent);
        content.readability = await this.analyzeReadability(textContent);
      } else if (technical.modality === "image") {
        // For images, we might extract text via OCR
        content.text = await this.extractImageText(filePath);
      }
    } catch (error) {
      this.logger.warn(`Failed to extract content metadata from ${filePath}:`, error);
    }

    return content;
  }

  /**
   * Extract data schema for structured data files
   */
  private async extractDataSchema(filePath: string, technical: TechnicalMetadata): Promise<DataSchema | undefined> {
    try {
      if (technical.fileType === "parquet") {
        // Use ParquetService for parquet files
        const { ParquetService } = await import("./ParquetService");
        const parquetService = new ParquetService();
        await parquetService.initialize();

        const parquetInfo = await parquetService.processParquetFile(filePath);
        return parquetInfo.schema;
      } else if (technical.fileType === "csv") {
        return await this.extractCSVSchema(filePath);
      } else if (technical.fileType === "json") {
        return await this.extractJSONSchema(filePath);
      }
    } catch (error) {
      this.logger.warn(`Failed to extract schema from ${filePath}:`, error);
    }

    return undefined;
  }

  /**
   * Extract column statistics
   */
  private async extractColumnStatistics(
    filePath: string,
    schema?: DataSchema
  ): Promise<ColumnStatistics[] | undefined> {
    try {
      if (!schema) {
        return undefined;
      }

      // For parquet files, use ParquetService
      if (filePath.endsWith(".parquet")) {
        const { ParquetService } = await import("./ParquetService");
        const parquetService = new ParquetService();
        await parquetService.initialize();

        const parquetInfo = await parquetService.processParquetFile(filePath);
        return parquetInfo.statistics;
      }

      // For other data formats, calculate basic statistics
      return await this.calculateBasicStatistics(filePath, schema);
    } catch (error) {
      this.logger.warn(`Failed to extract column statistics from ${filePath}:`, error);
      return undefined;
    }
  }

  /**
   * Extract custom metadata based on file type
   */
  private async extractCustomMetadata(filePath: string, technical: TechnicalMetadata): Promise<Record<string, any>> {
    const custom: Record<string, any> = {};

    try {
      if (technical.modality === "image") {
        custom.exif = await this.extractEXIFData(filePath);
        custom.colorProfile = await this.extractColorProfile(filePath);
      } else if (technical.modality === "video") {
        custom.codec = await this.extractVideoCodec(filePath);
        custom.frameRate = await this.extractFrameRate(filePath);
      } else if (technical.modality === "audio") {
        custom.codec = await this.extractAudioCodec(filePath);
        custom.channels = await this.extractAudioChannels(filePath);
      } else if (technical.modality === "code") {
        custom.language = await this.detectProgrammingLanguage(filePath);
        custom.complexity = await this.analyzeCodeComplexity(filePath);
        custom.dependencies = await this.extractDependencies(filePath);
      }
    } catch (error) {
      this.logger.warn(`Failed to extract custom metadata from ${filePath}:`, error);
    }

    return custom;
  }

  // ============================================================================
  // Modality-specific extraction methods
  // ============================================================================

  private async extractPDFMetadata(filePath: string): Promise<any> {
    // Mock implementation - would use pdf-parse or similar
    return {
      title: "",
      author: "",
      subject: "",
      keywords: [],
    };
  }

  private async extractImageMetadata(filePath: string): Promise<any> {
    // Mock implementation - would use sharp or similar
    return {
      description: "",
      keywords: [],
    };
  }

  private async extractTextMetadata(filePath: string): Promise<any> {
    // Mock implementation - would read and analyze text
    return {
      title: "",
      description: "",
      language: "en",
    };
  }

  private async extractImageTechnicalMetadata(filePath: string): Promise<any> {
    // Mock implementation - would use sharp or similar
    return {
      dimensions: { width: 1920, height: 1080 },
    };
  }

  private async extractVideoTechnicalMetadata(filePath: string): Promise<any> {
    // Mock implementation - would use ffprobe or similar
    return {
      dimensions: { width: 1920, height: 1080 },
      duration: 120.5,
      bitrate: 5000000,
    };
  }

  private async extractAudioTechnicalMetadata(filePath: string): Promise<any> {
    // Mock implementation - would use ffprobe or similar
    return {
      duration: 180.2,
      bitrate: 320000,
      sampleRate: 44100,
    };
  }

  private async extractDocumentTechnicalMetadata(filePath: string): Promise<any> {
    // Mock implementation - would use appropriate libraries
    return {
      pageCount: 10,
      wordCount: 2500,
    };
  }

  private async extractDataTechnicalMetadata(filePath: string): Promise<any> {
    // Mock implementation - would analyze data files
    return {
      rowCount: 1000,
      columnCount: 5,
    };
  }

  // ============================================================================
  // Content analysis methods
  // ============================================================================

  private async extractTextContent(filePath: string): Promise<string> {
    // Mock implementation - would read and extract text
    return "";
  }

  private async generateSummary(text: string): Promise<string> {
    // Mock implementation - would use AI summarization
    return "";
  }

  private async detectLanguage(text: string): Promise<string> {
    // Mock implementation - would use language detection
    return "en";
  }

  private async extractTopics(text: string): Promise<string[]> {
    // Mock implementation - would use topic modeling
    return [];
  }

  private async extractEntities(text: string): Promise<Array<{ name: string; type: string; confidence: number }>> {
    // Mock implementation - would use NER
    return [];
  }

  private async analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
    // Mock implementation - would use sentiment analysis
    return { score: 0, label: "neutral" };
  }

  private async analyzeReadability(text: string): Promise<{ score: number; level: string }> {
    // Mock implementation - would use readability analysis
    return { score: 0, level: "intermediate" };
  }

  private async extractImageText(filePath: string): Promise<string> {
    // Mock implementation - would use OCR
    return "";
  }

  // ============================================================================
  // Schema extraction methods
  // ============================================================================

  private async extractCSVSchema(filePath: string): Promise<DataSchema> {
    // Mock implementation - would analyze CSV structure
    return {
      columns: [],
      primaryKey: [],
      indexes: [],
      constraints: [],
    };
  }

  private async extractJSONSchema(filePath: string): Promise<DataSchema> {
    // Mock implementation - would analyze JSON structure
    return {
      columns: [],
      primaryKey: [],
      indexes: [],
      constraints: [],
    };
  }

  private async calculateBasicStatistics(filePath: string, schema: DataSchema): Promise<ColumnStatistics[]> {
    // Mock implementation - would calculate basic statistics
    return [];
  }

  // ============================================================================
  // Custom metadata extraction methods
  // ============================================================================

  private async extractEXIFData(filePath: string): Promise<any> {
    // Mock implementation - would use exif-reader
    return {};
  }

  private async extractColorProfile(filePath: string): Promise<any> {
    // Mock implementation - would analyze color profile
    return {};
  }

  private async extractVideoCodec(filePath: string): Promise<string> {
    // Mock implementation - would use ffprobe
    return "h264";
  }

  private async extractFrameRate(filePath: string): Promise<number> {
    // Mock implementation - would use ffprobe
    return 30;
  }

  private async extractAudioCodec(filePath: string): Promise<string> {
    // Mock implementation - would use ffprobe
    return "aac";
  }

  private async extractAudioChannels(filePath: string): Promise<number> {
    // Mock implementation - would use ffprobe
    return 2;
  }

  private async detectProgrammingLanguage(filePath: string): Promise<string> {
    // Mock implementation - would analyze file extension and content
    return "javascript";
  }

  private async analyzeCodeComplexity(filePath: string): Promise<any> {
    // Mock implementation - would analyze code complexity
    return { cyclomatic: 5, cognitive: 3 };
  }

  private async extractDependencies(filePath: string): Promise<string[]> {
    // Mock implementation - would extract dependencies
    return [];
  }

  // ============================================================================
  // Utility methods
  // ============================================================================

  private shouldExtractContent(modality: ModalityType): boolean {
    return ["text", "document", "image"].includes(modality);
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError(
        "MetadataService not initialized. Call initialize() first.",
        "METADATA_SERVICE_NOT_INITIALIZED"
      );
    }
  }
}
