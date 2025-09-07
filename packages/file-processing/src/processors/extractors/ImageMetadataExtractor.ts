/**
 * Image metadata extractor
 * 
 * Handles metadata extraction for image files including EXIF data,
 * animation detection, and basic image properties.
 */

import { ImageMetadata, ExifData } from "../../types";
import { BaseMetadataExtractor, MetadataExtractionOptions } from "./BaseMetadataExtractor";

export class ImageMetadataExtractor extends BaseMetadataExtractor {
  /**
   * Extract metadata from image files
   */
  async extractMetadata(
    file: File | string,
    options?: Partial<MetadataExtractionOptions>,
  ): Promise<ImageMetadata> {
    const mergedOptions = { ...this.options, ...options };
    const image = await this.loadImage(file);
    const basicInfo = await this.getBasicFileInfo(file);

    const metadata: ImageMetadata = {
      ...basicInfo,
      width: image.naturalWidth,
      height: image.naturalHeight,
      isAnimated: await this.detectImageAnimation(file),
      frameCount: 1, // Default for static images
      duration: 0, // Default for static images
      colorSpace: "sRGB", // Default assumption
      bitDepth: 8, // Default assumption
    };

    // Extract EXIF data if enabled
    if (mergedOptions.extractExif) {
      try {
        const exif = await this.extractExifData();
        if (exif) {
          metadata.exif = exif;
          // Update metadata with EXIF information
          if (exif.XResolution) metadata.width = exif.XResolution;
          if (exif.YResolution) metadata.height = exif.YResolution;
          if (exif.ISOSpeedRatings) metadata.bitDepth = exif.ISOSpeedRatings;
          if (exif.ColorSpace) metadata.colorSpace = exif.ColorSpace.toString();
        }
      } catch (error) {
        // EXIF extraction failed, continue without it
        console.warn("EXIF extraction failed:", error);
      }
    }

    // Detect animation for GIF and WebP
    if (metadata.isAnimated) {
      const animationInfo = await this.extractAnimationInfo();
      if (animationInfo) {
        metadata.frameCount = animationInfo.frameCount;
        metadata.duration = animationInfo.duration;
      }
    }

    return metadata;
  }

  /**
   * Load image from file
   */
  private async loadImage(file: File | string): Promise<HTMLImageElement> {
    const image = new Image();
    image.crossOrigin = "anonymous";

    if (typeof file === "string") {
      image.src = file;
    } else {
      image.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    return image;
  }

  /**
   * Detect if image is animated
   */
  private async detectImageAnimation(file: File | string): Promise<boolean> {
    // Simple detection based on file extension
    const extension = this.getFileExtension(
      typeof file === "string" ? file : file.name,
    );
    return extension === ".gif" || extension === ".webp";
  }

  /**
   * Extract EXIF data from image
   */
  private async extractExifData(): Promise<ExifData | null> {
    // This would require a proper EXIF library
    // For now, return null
    return null;
  }

  /**
   * Extract animation information
   */
  private async extractAnimationInfo(): Promise<{
    frameCount: number;
    duration: number;
  } | null> {
    // This would require parsing the actual file format
    // For now, return null
    return null;
  }
}
