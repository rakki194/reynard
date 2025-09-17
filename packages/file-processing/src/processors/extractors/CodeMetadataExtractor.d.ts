/**
 * Code Metadata Extractor for the Reynard File Processing system.
 *
 * Handles metadata extraction for code files including language detection,
 * dependency analysis, and code purpose detection.
 */
import { CodeMetadata } from "../../types";
import { BaseMetadataExtractor } from "./BaseMetadataExtractor";
export declare class CodeMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from code files
     */
    extractMetadata(file: File | string): Promise<CodeMetadata>;
}
