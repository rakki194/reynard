/**
 * Document metadata extractor
 *
 * Handles metadata extraction for document files including PDFs,
 * Word documents, and other document formats.
 */
import { BaseMetadataExtractor, } from "./BaseMetadataExtractor";
export class DocumentMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from document files
     */
    async extractMetadata(file, options) {
        const mergedOptions = { ...this.options, ...options };
        const basicInfo = await this.getBasicFileInfo(file);
        const extension = this.getFileExtension(basicInfo.name);
        const metadata = {
            ...basicInfo,
            documentType: extension.substring(1).toUpperCase(),
            pageCount: 1, // Default assumption
            title: "", // Would need to extract from file content
            author: "", // Would need to extract from file content
            subject: "", // Would need to extract from file content
            keywords: [], // Would need to extract from file content
            hasText: true, // Default assumption
            ocrConfidence: 0, // Default assumption
        };
        // Try to extract document information
        if (mergedOptions.extractEmbedded) {
            try {
                const docInfo = await this.extractDocumentInfo();
                if (docInfo) {
                    metadata.pageCount = docInfo.pageCount || metadata.pageCount;
                    metadata.title = docInfo.title || metadata.title;
                    metadata.author = docInfo.author || metadata.author;
                    metadata.subject = docInfo.subject || metadata.subject;
                    metadata.keywords = docInfo.keywords || metadata.keywords;
                    metadata.hasText = docInfo.hasText ?? metadata.hasText;
                    metadata.ocrConfidence =
                        docInfo.ocrConfidence || metadata.ocrConfidence;
                }
            }
            catch (error) {
                console.warn("Document info extraction failed:", error);
            }
        }
        return metadata;
    }
    /**
     * Extract document information from file content
     */
    async extractDocumentInfo() {
        // This would require parsing the actual document format
        // For now, return null
        return null;
    }
}
