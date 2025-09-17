/**
 * LoRA Metadata Extractor for the Reynard File Processing system.
 *
 * Handles metadata extraction for LoRA model files including model information,
 * training data, and parameter extraction.
 */
import { LoraMetadata, MetadataExtractionOptions } from "../../types";
import { BaseMetadataExtractor } from "./BaseMetadataExtractor";
export declare class LoraMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from LoRA model files
     */
    extractMetadata(file: File | string, options: MetadataExtractionOptions): Promise<LoraMetadata>;
    private extractLoraModelInfo;
}
