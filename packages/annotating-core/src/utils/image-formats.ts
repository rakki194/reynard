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

// Base supported formats (always available)
export const BASE_IMAGE_FORMATS: Record<string, ImageFormatInfo> = {
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
};

// Plugin-dependent formats (updated at runtime)
export const PLUGIN_IMAGE_FORMATS: Record<string, ImageFormatInfo> = {
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

// Combined formats (updated at runtime)
export const SUPPORTED_IMAGE_FORMATS: Record<string, ImageFormatInfo> = {
  ...BASE_IMAGE_FORMATS,
  ...PLUGIN_IMAGE_FORMATS,
};

export class ImageFormatUtils {
  private static pluginSupportCache: {
    jxlSupported: boolean | null;
    avifSupported: boolean | null;
    lastChecked: number | null;
  } = {
    jxlSupported: null,
    avifSupported: null,
    lastChecked: null,
  };

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Update plugin support based on backend API response.
   */
  static async updatePluginSupport(): Promise<void> {
    try {
      // Check cache first
      const now = Date.now();
      if (
        this.pluginSupportCache.lastChecked &&
        now - this.pluginSupportCache.lastChecked < this.CACHE_DURATION &&
        this.pluginSupportCache.jxlSupported !== null &&
        this.pluginSupportCache.avifSupported !== null
      ) {
        return; // Use cached values
      }

      // Fetch from backend API
      const response = await fetch("/api/image-utils/service-info");
      if (!response.ok) {
        console.warn("Failed to fetch image processing service info");
        return;
      }

      const serviceInfo = await response.json();
      
      // Update cache
      this.pluginSupportCache = {
        jxlSupported: serviceInfo.jxl_supported || false,
        avifSupported: serviceInfo.avif_supported || false,
        lastChecked: now,
      };

      // Update format support
      if (this.pluginSupportCache.jxlSupported) {
        SUPPORTED_IMAGE_FORMATS[".jxl"] = {
          ...PLUGIN_IMAGE_FORMATS[".jxl"],
          supported: true,
        };
      } else {
        SUPPORTED_IMAGE_FORMATS[".jxl"] = {
          ...PLUGIN_IMAGE_FORMATS[".jxl"],
          supported: false,
        };
      }

      if (this.pluginSupportCache.avifSupported) {
        SUPPORTED_IMAGE_FORMATS[".avif"] = {
          ...PLUGIN_IMAGE_FORMATS[".avif"],
          supported: true,
        };
      } else {
        SUPPORTED_IMAGE_FORMATS[".avif"] = {
          ...PLUGIN_IMAGE_FORMATS[".avif"],
          supported: false,
        };
      }
    } catch (error) {
      console.warn("Failed to update plugin support:", error);
    }
  }

  /**
   * Get supported image file extensions with runtime plugin detection.
   *
   * @returns Set of supported file extensions (lowercase, with dot)
   */
  static async getSupportedFormats(): Promise<Set<string>> {
    // Update plugin support before returning
    await this.updatePluginSupport();
    
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
  static async isSupportedFormat(extension: string): Promise<boolean> {
    const normalizedExt = extension.toLowerCase();
    
    // For plugin formats, check runtime availability
    if (normalizedExt in PLUGIN_IMAGE_FORMATS) {
      await this.updatePluginSupport();
    }
    
    const format = SUPPORTED_IMAGE_FORMATS[normalizedExt];
    return format?.supported ?? false;
  }

  /**
   * Get format information for an extension.
   *
   * @param extension - File extension
   * @returns Format information or undefined
   */
  static async getFormatInfo(extension: string): Promise<ImageFormatInfo | undefined> {
    const normalizedExt = extension.toLowerCase();
    
    // For plugin formats, check runtime availability
    if (normalizedExt in PLUGIN_IMAGE_FORMATS) {
      await this.updatePluginSupport();
    }
    
    return SUPPORTED_IMAGE_FORMATS[normalizedExt];
  }

  /**
   * Validate image file path.
   *
   * @param filePath - Path to validate
   * @returns True if the path appears to be a supported image
   */
  static async validateImagePath(filePath: string): Promise<boolean> {
    const path = filePath.toLowerCase();
    const extension = this.getFileExtension(filePath);
    
    // Check if it's a plugin format and update support
    if (extension in PLUGIN_IMAGE_FORMATS) {
      await this.updatePluginSupport();
    }
    
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
