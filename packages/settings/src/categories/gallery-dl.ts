/**
 * Gallery-dl Settings Category
 *
 * Settings configuration for gallery-dl integration with Reynard.
 * Provides comprehensive configuration options for download management.
 */

import { SettingCategory, SettingDefinition } from "../types";

export const galleryDlSettings: SettingCategory = {
  name: "Gallery Downloads",
  description: "Gallery-dl integration settings for downloading media from various sources",
  icon: "download",
  order: 13,
  settings: [
    // Download Settings
    {
      key: "defaultOutputDirectory",
      type: "string",
      default: "~/Downloads/gallery-dl",
      description: "Default directory for downloaded files",
      validation: {
        required: true,
        minLength: 1,
        pattern: "^[^<>:\"|?*]+$"
      },
      category: "download"
    },
    {
      key: "maxConcurrentDownloads",
      type: "number",
      default: 3,
      description: "Maximum number of concurrent downloads",
      validation: {
        min: 1,
        max: 10
      },
      category: "download"
    },
    {
      key: "defaultRetries",
      type: "number",
      default: 3,
      description: "Default number of retries for failed downloads",
      validation: {
        min: 0,
        max: 10
      },
      category: "download"
    },
    {
      key: "defaultTimeout",
      type: "number",
      default: 30,
      description: "Default timeout in seconds for downloads",
      validation: {
        min: 5,
        max: 300
      },
      category: "download"
    },
    {
      key: "sleepBetweenDownloads",
      type: "number",
      default: 1,
      description: "Sleep time in seconds between downloads",
      validation: {
        min: 0,
        max: 10,
        step: 0.1
      },
      category: "download"
    },

    // File Settings
    {
      key: "filenameFormat",
      type: "string",
      default: "{filename}",
      description: "Default filename format for downloaded files",
      validation: {
        required: true,
        minLength: 1
      },
      category: "files"
    },
    {
      key: "minFileSize",
      type: "number",
      default: 0,
      description: "Minimum file size in bytes (0 = no limit)",
      validation: {
        min: 0
      },
      category: "files"
    },
    {
      key: "maxFileSize",
      type: "number",
      default: 0,
      description: "Maximum file size in bytes (0 = no limit)",
      validation: {
        min: 0
      },
      category: "files"
    },
    {
      key: "createSubdirectories",
      type: "boolean",
      default: true,
      description: "Create subdirectories based on gallery structure",
      category: "files"
    },
    {
      key: "skipExistingFiles",
      type: "boolean",
      default: true,
      description: "Skip files that already exist",
      category: "files"
    },

    // Extractor Settings
    {
      key: "enableCustomExtractors",
      type: "boolean",
      default: true,
      description: "Enable Reynard custom extractors",
      category: "extractors"
    },
    {
      key: "extractorOptions",
      type: "object",
      default: {},
      description: "Default options for specific extractors",
      validation: {
        schema: {
          type: "object",
          additionalProperties: {
            type: "object"
          }
        }
      },
      category: "extractors"
    },
    {
      key: "allowedExtractors",
      type: "array",
      default: [],
      description: "List of allowed extractors (empty = all allowed)",
      validation: {
        items: {
          type: "string"
        }
      },
      category: "extractors"
    },
    {
      key: "blockedExtractors",
      type: "array",
      default: [],
      description: "List of blocked extractors",
      validation: {
        items: {
          type: "string"
        }
      },
      category: "extractors"
    },

    // Postprocessor Settings
    {
      key: "defaultPostprocessors",
      type: "array",
      default: [],
      description: "Default postprocessors to apply to downloaded files",
      validation: {
        items: {
          type: "string",
          enum: ["metadata", "thumbnail", "resize", "compress", "watermark"]
        }
      },
      category: "postprocessors"
    },
    {
      key: "generateThumbnails",
      type: "boolean",
      default: true,
      description: "Generate thumbnails for downloaded images",
      category: "postprocessors"
    },
    {
      key: "thumbnailSize",
      type: "number",
      default: 200,
      description: "Thumbnail size in pixels",
      validation: {
        min: 50,
        max: 1000
      },
      category: "postprocessors"
    },
    {
      key: "extractMetadata",
      type: "boolean",
      default: true,
      description: "Extract and save metadata from downloaded files",
      category: "postprocessors"
    },

    // Advanced Settings
    {
      key: "userAgent",
      type: "string",
      default: "Mozilla/5.0 (compatible; Reynard Gallery-dl/1.0)",
      description: "User agent string for HTTP requests",
      validation: {
        required: true,
        minLength: 10
      },
      category: "advanced"
    },
    {
      key: "customHeaders",
      type: "object",
      default: {},
      description: "Custom HTTP headers to include in requests",
      validation: {
        schema: {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        }
      },
      category: "advanced"
    },
    {
      key: "enableLogging",
      type: "boolean",
      default: true,
      description: "Enable detailed logging for downloads",
      category: "advanced"
    },
    {
      key: "logLevel",
      type: "string",
      default: "info",
      description: "Logging level for gallery-dl operations",
      validation: {
        enum: ["debug", "info", "warning", "error"]
      },
      category: "advanced"
    },
    {
      key: "maxLogFileSize",
      type: "number",
      default: 10485760, // 10MB
      description: "Maximum log file size in bytes",
      validation: {
        min: 1048576, // 1MB
        max: 104857600 // 100MB
      },
      category: "advanced"
    },

    // AI Integration Settings
    {
      key: "enableAIMetadata",
      type: "boolean",
      default: false,
      description: "Enable AI-powered metadata extraction",
      category: "ai"
    },
    {
      key: "aiMetadataProvider",
      type: "string",
      default: "reynard",
      description: "AI metadata extraction provider",
      validation: {
        enum: ["reynard", "openai", "anthropic", "local"]
      },
      category: "ai"
    },
    {
      key: "aiMetadataConfidence",
      type: "number",
      default: 0.8,
      description: "Minimum confidence threshold for AI metadata",
      validation: {
        min: 0,
        max: 1,
        step: 0.1
      },
      category: "ai"
    },
    {
      key: "autoTagImages",
      type: "boolean",
      default: false,
      description: "Automatically generate tags for downloaded images",
      category: "ai"
    },
    {
      key: "autoCategorize",
      type: "boolean",
      default: false,
      description: "Automatically categorize downloaded content",
      category: "ai"
    },

    // Security Settings
    {
      key: "requireAuthentication",
      type: "boolean",
      default: true,
      description: "Require user authentication for downloads",
      category: "security"
    },
    {
      key: "allowedDomains",
      type: "array",
      default: [],
      description: "List of allowed domains for downloads (empty = all allowed)",
      validation: {
        items: {
          type: "string",
          pattern: "^[a-zA-Z0-9.-]+$"
        }
      },
      category: "security"
    },
    {
      key: "blockedDomains",
      type: "array",
      default: [],
      description: "List of blocked domains for downloads",
      validation: {
        items: {
          type: "string",
          pattern: "^[a-zA-Z0-9.-]+$"
        }
      },
      category: "security"
    },
    {
      key: "maxDownloadSize",
      type: "number",
      default: 1073741824, // 1GB
      description: "Maximum total download size per session in bytes",
      validation: {
        min: 1048576, // 1MB
        max: 10737418240 // 10GB
      },
      category: "security"
    },
    {
      key: "rateLimitPerMinute",
      type: "number",
      default: 60,
      description: "Maximum downloads per minute per user",
      validation: {
        min: 1,
        max: 300
      },
      category: "security"
    }
  ]
};

// Helper function to get default configuration
export function getDefaultGalleryDlConfig(): Record<string, any> {
  const config: Record<string, any> = {};
  
  galleryDlSettings.settings.forEach(setting => {
    config[setting.key] = setting.default;
  });
  
  return config;
}

// Helper function to validate configuration
export function validateGalleryDlConfig(config: Record<string, any>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  galleryDlSettings.settings.forEach(setting => {
    const value = config[setting.key];
    
    // Check required fields
    if (setting.validation?.required && (value === undefined || value === null || value === "")) {
      errors.push(`${setting.key} is required`);
      return;
    }
    
    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      return;
    }
    
    // Type validation
    if (setting.type === "number" && typeof value !== "number") {
      errors.push(`${setting.key} must be a number`);
      return;
    }
    
    if (setting.type === "boolean" && typeof value !== "boolean") {
      errors.push(`${setting.key} must be a boolean`);
      return;
    }
    
    if (setting.type === "string" && typeof value !== "string") {
      errors.push(`${setting.key} must be a string`);
      return;
    }
    
    if (setting.type === "array" && !Array.isArray(value)) {
      errors.push(`${setting.key} must be an array`);
      return;
    }
    
    if (setting.type === "object" && typeof value !== "object") {
      errors.push(`${setting.key} must be an object`);
      return;
    }
    
    // Additional validation
    if (setting.validation) {
      const validation = setting.validation;
      
      if (validation.minLength && typeof value === "string" && value.length < validation.minLength) {
        errors.push(`${setting.key} must be at least ${validation.minLength} characters long`);
      }
      
      if (validation.maxLength && typeof value === "string" && value.length > validation.maxLength) {
        errors.push(`${setting.key} must be at most ${validation.maxLength} characters long`);
      }
      
      if (validation.min && typeof value === "number" && value < validation.min) {
        errors.push(`${setting.key} must be at least ${validation.min}`);
      }
      
      if (validation.max && typeof value === "number" && value > validation.max) {
        errors.push(`${setting.key} must be at most ${validation.max}`);
      }
      
      if (validation.pattern && typeof value === "string" && !new RegExp(validation.pattern).test(value)) {
        errors.push(`${setting.key} format is invalid`);
      }
      
      if (validation.enum && !validation.enum.includes(value)) {
        errors.push(`${setting.key} must be one of: ${validation.enum.join(", ")}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
