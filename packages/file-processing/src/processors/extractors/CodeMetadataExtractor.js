/**
 * Code Metadata Extractor for the Reynard File Processing system.
 *
 * Handles metadata extraction for code files including language detection,
 * dependency analysis, and code purpose detection.
 */
import { BaseMetadataExtractor } from "./BaseMetadataExtractor";
import { detectProgrammingLanguage, extractDependencies, detectCodePurpose, } from "../utils/language-detection";
export class CodeMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from code files
     */
    async extractMetadata(file) {
        const text = await this.loadText(file);
        const basicInfo = await this.getBasicFileInfo(file);
        const extension = this.getFileExtension(basicInfo.name);
        const metadata = {
            ...basicInfo,
            language: detectProgrammingLanguage(extension),
            lineCount: text.split("\n").length,
            characterCount: text.length,
            hasSyntaxErrors: false, // Would need syntax checking
            dependencies: extractDependencies(text, extension),
            purpose: detectCodePurpose(extension),
        };
        return metadata;
    }
}
