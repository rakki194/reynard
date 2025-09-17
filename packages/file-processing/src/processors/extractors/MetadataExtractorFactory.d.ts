/**
 * Metadata Extractor Factory
 *
 * Creates appropriate metadata extractors based on file type
 */
import { BaseMetadataExtractor, MetadataExtractionOptions } from "./BaseMetadataExtractor";
export declare class MetadataExtractorFactory {
    /**
     * Create a metadata extractor for the given file
     */
    static createExtractor(filename: string, options?: MetadataExtractionOptions): BaseMetadataExtractor;
    /**
     * Get file extension from filename
     */
    private static getFileExtension;
}
