/**
 * Base metadata extractor interface
 *
 * Provides common functionality for all metadata extractors
 */
import { FileMetadata } from "../../types";
export interface MetadataExtractionOptions {
    /** Whether to extract EXIF data from images */
    extractExif?: boolean;
    /** Whether to perform content analysis */
    analyzeContent?: boolean;
    /** Whether to detect language for text files */
    detectLanguage?: boolean;
    /** Whether to extract embedded metadata */
    extractEmbedded?: boolean;
    /** Maximum content length to analyze */
    maxContentLength?: number;
}
export declare abstract class BaseMetadataExtractor {
    protected options: MetadataExtractionOptions;
    constructor(options?: MetadataExtractionOptions);
    /**
     * Extract metadata from a file
     */
    abstract extractMetadata(file: File | string, options?: Partial<MetadataExtractionOptions>): Promise<FileMetadata>;
    /**
     * Get basic file information
     */
    protected getBasicFileInfo(file: File | string): Promise<FileMetadata>;
    /**
     * Get file information
     */
    protected getFileInfo(file: File | string): Promise<{
        success: boolean;
        data?: {
            name: string;
            size: number;
            type: string;
        };
        error?: string;
    }>;
    /**
     * Get file extension from filename
     */
    protected getFileExtension(filename: string): string;
    /**
     * Load text content from file
     */
    protected loadText(file: File | string): Promise<string>;
}
