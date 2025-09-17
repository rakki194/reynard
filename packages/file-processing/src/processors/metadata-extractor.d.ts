/**
 * Metadata Extractor for the Reynard File Processing system.
 *
 * This module provides unified metadata extraction for various file types
 * using a factory pattern with specialized extractors.
 */
import { ProcessingResult, FileMetadata } from "../types";
import { MetadataExtractionOptions } from "./extractors";
export type { MetadataExtractionOptions };
export declare class MetadataExtractor {
    private options;
    constructor(options?: MetadataExtractionOptions);
    /**
     * Extract metadata from any supported file type
     */
    extractMetadata(file: File | string, options?: Partial<MetadataExtractionOptions>): Promise<ProcessingResult<FileMetadata>>;
    private getFileInfo;
    private getFileExtension;
}
