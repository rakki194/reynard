/**
 * Image Format Utilities
 *
 * Utilities for handling image formats and validation in Reynard's
 * caption generation system. Provides format detection and validation
 * without heavy image processing dependencies.
 */

export interface ImageFormatInfo {
  extension: string;
  mimeType: string;
  supported: boolean;
  requiresPlugin?: boolean;
  description: string;
}

export const SUPPORTED_IMAGE_FORMATS: Record<string, ImageFormatInfo> = {
  ".jpg": {
    extension: ".jpg",
    mimeType: "image/jpeg",
    supported: true,
    description: "JPEG image format",
  },
  ".jpeg": {
    extension: ".jpeg",
    mimeType: "image/jpeg",
    supported: true,
    description: "JPEG image format",
  },
  ".png": {
    extension: ".png",
    mimeType: "image/png",
    supported: true,
    description: "PNG image format",
  },
  ".gif": {
    extension: ".gif",
    mimeType: "image/gif",
    supported: true,
    description: "GIF image format",
  },
  ".bmp": {
    extension: ".bmp",
    mimeType: "image/bmp",
    supported: true,
    description: "Bitmap image format",
  },
  ".tiff": {
    extension: ".tiff",
    mimeType: "image/tiff",
    supported: true,
    description: "TIFF image format",
  },
  ".tif": {
    extension: ".tif",
    mimeType: "image/tiff",
    supported: true,
    description: "TIFF image format",
  },
  ".webp": {
    extension: ".webp",
    mimeType: "image/webp",
    supported: true,
    description: "WebP image format",
  },
  ".jxl": {
    extension: ".jxl",
    mimeType: "image/jxl",
    supported: false,
    requiresPlugin: true,
    description: "JPEG XL image format (requires plugin)",
  },
  ".avif": {
    extension: ".avif",
    mimeType: "image/avif",
    supported: false,
    requiresPlugin: true,
    description: "AVIF image format (requires plugin)",
  },
};

export class ImageFormatUtils {
  /**
   * Get supported image file extensions.
   *
   * @returns Set of supported file extensions (lowercase, with dot)
   */
  static getSupportedFormats(): Set<string> {
    const formats = new Set<string>();
    for (const [ext, info] of Object.entries(SUPPORTED_IMAGE_FORMATS)) {
      if (info.supported) {
        formats.add(ext);
      }
    }
    return formats;
  }

  /**
   * Check if a file extension is supported.
   *
   * @param extension - File extension to check
   * @returns True if the extension is supported
   */
  static isSupportedFormat(extension: string): boolean {
    const normalizedExt = extension.toLowerCase();
    const format = SUPPORTED_IMAGE_FORMATS[normalizedExt];
    return format?.supported ?? false;
  }

  /**
   * Get format information for an extension.
   *
   * @param extension - File extension
   * @returns Format information or undefined
   */
  static getFormatInfo(extension: string): ImageFormatInfo | undefined {
    return SUPPORTED_IMAGE_FORMATS[extension.toLowerCase()];
  }

  /**
   * Validate image file path.
   *
   * @param filePath - Path to validate
   * @returns True if the path appears to be a supported image
   */
  static validateImagePath(filePath: string): boolean {
    const path = filePath.toLowerCase();
    return Object.keys(SUPPORTED_IMAGE_FORMATS).some((ext) =>
      path.endsWith(ext),
    );
  }

  /**
   * Extract file extension from path.
   *
   * @param filePath - File path
   * @returns File extension (lowercase, with dot)
   */
  static getFileExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf(".");
    return lastDot !== -1 ? filePath.substring(lastDot).toLowerCase() : "";
  }

  /**
   * Get MIME type for file extension.
   *
   * @param extension - File extension
   * @returns MIME type or undefined
   */
  static getMimeType(extension: string): string | undefined {
    return SUPPORTED_IMAGE_FORMATS[extension.toLowerCase()]?.mimeType;
  }

  /**
   * Check if format requires additional plugins.
   *
   * @param extension - File extension
   * @returns True if the format requires plugins
   */
  static requiresPlugin(extension: string): boolean {
    return (
      SUPPORTED_IMAGE_FORMATS[extension.toLowerCase()]?.requiresPlugin ?? false
    );
  }

  /**
   * Check if image format supports transparency.
   *
   * @param extension - File extension
   * @returns True if the format supports transparency
   */
  static supportsTransparency(extension: string): boolean {
    const format = extension.toLowerCase();
    return [".png", ".gif", ".webp"].includes(format);
  }

  /**
   * Get all available formats (including unsupported ones).
   *
   * @returns Array of all format information
   */
  static getAllFormats(): ImageFormatInfo[] {
    return Object.values(SUPPORTED_IMAGE_FORMATS);
  }

  /**
   * Get only supported formats.
   *
   * @returns Array of supported format information
   */
  static getSupportedFormatsInfo(): ImageFormatInfo[] {
    return Object.values(SUPPORTED_IMAGE_FORMATS).filter(
      (format) => format.supported,
    );
  }

  /**
   * Generate image filename with proper extension.
   *
   * @param baseName - Base filename without extension
   * @param extension - Desired extension
   * @param suffix - Optional suffix to add
   * @returns Generated filename
   */
  static generateFilename(
    baseName: string,
    extension: string,
    suffix?: string,
  ): string {
    const normalizedExt = extension.startsWith(".")
      ? extension
      : `.${extension}`;
    const suffixPart = suffix ? `_${suffix}` : "";
    return `${baseName}${suffixPart}${normalizedExt}`;
  }
}
