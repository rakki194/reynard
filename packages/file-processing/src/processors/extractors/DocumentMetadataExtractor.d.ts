/**
 * Document metadata extractor
 *
 * Handles metadata extraction for document files including PDFs,
 * Word documents, and other document formats.
 */
import { DocumentMetadata } from "../../types";
import { BaseMetadataExtractor, MetadataExtractionOptions } from "./BaseMetadataExtractor";
export declare class DocumentMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from document files
     */
    extractMetadata(file: File | string, options?: Partial<MetadataExtractionOptions>): Promise<DocumentMetadata>;
    /**
     * Extract document information from file content
     */
    private extractDocumentInfo;
}
