/**
 * Metadata Extractor Factory
 * 
 * Creates appropriate metadata extractors based on file type
 */

import { getFileCategory } from "../../config/file-types";
import { BaseMetadataExtractor, MetadataExtractionOptions } from "./BaseMetadataExtractor";
import { ImageMetadataExtractor } from "./ImageMetadataExtractor";
import { VideoMetadataExtractor } from "./VideoMetadataExtractor";
import { AudioMetadataExtractor } from "./AudioMetadataExtractor";
import { DocumentMetadataExtractor } from "./DocumentMetadataExtractor";

export class MetadataExtractorFactory {
  /**
   * Create a metadata extractor for the given file
   */
  static createExtractor(
    filename: string,
    options?: MetadataExtractionOptions,
  ): BaseMetadataExtractor {
    const extension = this.getFileExtension(filename);
    const category = getFileCategory(extension);

    switch (category) {
      case "image":
        return new ImageMetadataExtractor(options);
      case "video":
        return new VideoMetadataExtractor(options);
      case "audio":
        return new AudioMetadataExtractor(options);
      case "document":
        return new DocumentMetadataExtractor(options);
      default:
        throw new Error(`Unsupported file category: ${category}`);
    }
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : "";
  }
}
