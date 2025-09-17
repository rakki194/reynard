/**
 * Image metadata extractor
 *
 * Handles metadata extraction for image files including EXIF data,
 * animation detection, and basic image properties.
 */
import { ImageMetadata } from "../../types";
import { BaseMetadataExtractor, MetadataExtractionOptions } from "./BaseMetadataExtractor";
export declare class ImageMetadataExtractor extends BaseMetadataExtractor {
    /**
     * Extract metadata from image files
     */
    extractMetadata(file: File | string, options?: Partial<MetadataExtractionOptions>): Promise<ImageMetadata>;
    /**
     * Load image from file
     */
    private loadImage;
    /**
     * Detect if image is animated
     */
    private detectImageAnimation;
    /**
     * Extract EXIF data from image
     */
    private extractExifData;
    /**
     * Extract animation information
     */
    private extractAnimationInfo;
}
