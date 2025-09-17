/**
 * Metadata Service
 *
 * Comprehensive metadata extraction service for all file types and modalities.
 * Integrates with existing file processing capabilities and provides unified metadata management.
 */
import type { ColumnStatistics, DataSchema, FileType, ModalityType } from "../types";
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
    dimensions?: {
        width: number;
        height: number;
    };
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
    entities?: Array<{
        name: string;
        type: string;
        confidence: number;
    }>;
    sentiment?: {
        score: number;
        label: string;
    };
    readability?: {
        score: number;
        level: string;
    };
}
export declare class MetadataService extends BaseAIService {
    private initialized;
    private processingPipeline;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Extract comprehensive metadata from a file
     */
    extractMetadata(filePath: string, options?: MetadataExtractionOptions): Promise<ExtractedMetadata>;
    /**
     * Get basic file information
     */
    private getBasicFileInfo;
    /**
     * Extract basic metadata (title, description, author, etc.)
     */
    private extractBasicMetadata;
    /**
     * Extract technical metadata
     */
    private extractTechnicalMetadata;
    /**
     * Extract content metadata
     */
    private extractContentMetadata;
    /**
     * Extract data schema for structured data files
     */
    private extractDataSchema;
    /**
     * Extract column statistics
     */
    private extractColumnStatistics;
    /**
     * Extract custom metadata based on file type
     */
    private extractCustomMetadata;
    private extractPDFMetadata;
    private extractImageMetadata;
    private extractTextMetadata;
    private extractImageTechnicalMetadata;
    private extractVideoTechnicalMetadata;
    private extractAudioTechnicalMetadata;
    private extractDocumentTechnicalMetadata;
    private extractDataTechnicalMetadata;
    private extractTextContent;
    private generateSummary;
    private detectLanguage;
    private extractTopics;
    private extractEntities;
    private analyzeSentiment;
    private analyzeReadability;
    private extractImageText;
    private extractCSVSchema;
    private extractJSONSchema;
    private calculateBasicStatistics;
    private extractEXIFData;
    private extractColorProfile;
    private extractVideoCodec;
    private extractFrameRate;
    private extractAudioCodec;
    private extractAudioChannels;
    private detectProgrammingLanguage;
    private analyzeCodeComplexity;
    private extractDependencies;
    private shouldExtractContent;
    private ensureInitialized;
}
