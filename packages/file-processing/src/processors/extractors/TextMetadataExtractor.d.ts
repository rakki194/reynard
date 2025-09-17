/**
 * Text Metadata Extractor for the Reynard File Processing system.
 *
 * Handles metadata extraction for text files including language detection,
 * content analysis, and structured data detection.
 */
import { TextMetadata, MetadataExtractionOptions } from "../../types";
import { BaseMetadataExtractor } from "./BaseMetadataExtractor";
export declare class TextMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from text files
     */
    extractMetadata(file: File | string, options: MetadataExtractionOptions): Promise<TextMetadata>;
    private detectStructuredData;
    private detectLanguage;
    private analyzeTextContent;
}
