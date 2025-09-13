/**
 * Text Metadata Extractor for the Reynard File Processing system.
 *
 * Handles metadata extraction for text files including language detection,
 * content analysis, and structured data detection.
 */

import { TextMetadata, MetadataExtractionOptions } from "../../types";
import { BaseMetadataExtractor } from "./BaseMetadataExtractor";

export class TextMetadataExtractor extends BaseMetadataExtractor {
  /**
   * Extract metadata from text files
   */
  async extractMetadata(
    file: File | string,
    options: MetadataExtractionOptions,
  ): Promise<TextMetadata> {
    const text = await this.loadText(file);
    const basicInfo = await this.getBasicFileInfo(file);

    const metadata: TextMetadata = {
      ...basicInfo,
      lineCount: text.split("\n").length,
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
      encoding: "UTF-8", // Default assumption
      isStructured: this.detectStructuredData(text),
    };

    // Detect language if enabled
    if (options.detectLanguage) {
      try {
        metadata.language = await this.detectLanguage(text);
      } catch (error) {
        console.warn("Language detection failed:", error);
      }
    }

    // Analyze content if enabled
    if (options.analyzeContent) {
      try {
        const contentAnalysis = await this.analyzeTextContent();
        if (contentAnalysis) {
          metadata.encoding = contentAnalysis.encoding || metadata.encoding;
        }
      } catch (error) {
        console.warn("Content analysis failed:", error);
      }
    }

    return metadata;
  }

  private detectStructuredData(text: string): boolean {
    // Simple detection of structured data formats
    const trimmed = text.trim();
    return (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) || // JSON
      (trimmed.startsWith("<") && trimmed.endsWith(">")) || // XML
      trimmed.includes("\t") || // TSV
      (trimmed.includes(",") && trimmed.includes("\n")) // CSV
    );
  }

  private async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on common patterns
    const sample = text.substring(0, Math.min(1000, text.length)).toLowerCase();

    if (sample.includes("the") && sample.includes("and")) return "en";
    if (sample.includes("der") && sample.includes("die")) return "de";
    if (sample.includes("le") && sample.includes("la")) return "fr";
    if (sample.includes("el") && sample.includes("la")) return "es";
    if (sample.includes("il") && sample.includes("la")) return "it";

    return "unknown";
  }

  private async analyzeTextContent(): Promise<{ encoding: string } | null> {
    // Simple encoding detection
    return { encoding: "UTF-8" };
  }
}
