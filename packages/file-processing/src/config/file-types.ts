/**
 * File type configuration for the Reynard File Processing system.
 *
 * This module aggregates supported file extensions, MIME types, and processing
 * capabilities for different file categories from specialized modules.
 */

import { FileTypeInfo } from "../types";

// Import category-specific extensions and MIME type functions
import { IMAGE_EXTENSIONS, getImageMimeType } from "./image-types";
import { VIDEO_EXTENSIONS, getVideoMimeType } from "./video-types";
import { AUDIO_EXTENSIONS, getAudioMimeType } from "./audio-types";
import { TEXT_EXTENSIONS, getTextMimeType } from "./text-types";
import { CODE_EXTENSIONS, getCodeMimeType } from "./code-types";
import { DOCUMENT_EXTENSIONS, getDocumentMimeType } from "./document-types";
import { ARCHIVE_EXTENSIONS, getArchiveMimeType } from "./archive-types";
import { 
  LORA_EXTENSIONS, 
  OCR_EXTENSIONS, 
  CAPTION_EXTENSIONS, 
  METADATA_EXTENSIONS,
  getSpecialMimeType
} from "./special-types";

// Re-export all extensions for backward compatibility
export {
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  AUDIO_EXTENSIONS,
  TEXT_EXTENSIONS,
  CODE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  ARCHIVE_EXTENSIONS,
  LORA_EXTENSIONS,
  OCR_EXTENSIONS,
  CAPTION_EXTENSIONS,
  METADATA_EXTENSIONS,
};

/**
 * Get file type information for a given extension
 */
export function getFileTypeInfo(extension: string): FileTypeInfo {
  const ext = extension.toLowerCase();

  if (IMAGE_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "image",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: true,
        ocr: OCR_EXTENSIONS.has(ext),
      },
    };
  }

  if (VIDEO_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "video",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  if (AUDIO_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "audio",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "text",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: true,
        ocr: false,
      },
    };
  }

  if (CODE_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "code",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: true,
        ocr: false,
      },
    };
  }

  if (DOCUMENT_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "document",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: ext === ".pdf" || ext === ".txt",
        ocr: true,
      },
    };
  }

  if (LORA_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "other",
      isSupported: true,
      capabilities: {
        thumbnail: false,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  if (ARCHIVE_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "archive",
      isSupported: false, // Archives not currently supported for processing
      capabilities: {
        thumbnail: false,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  // Unknown file type
  return {
    extension: ext,
    mimeType: getMimeType(ext),
    category: "other",
    isSupported: false,
    capabilities: {
      thumbnail: false,
      metadata: false,
      content: false,
      ocr: false,
    },
  };
}

/**
 * Get MIME type for a file extension
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase();

  // Check each category for MIME type
  if (IMAGE_EXTENSIONS.has(ext)) {
    return getImageMimeType(ext);
  }
  if (VIDEO_EXTENSIONS.has(ext)) {
    return getVideoMimeType(ext);
  }
  if (AUDIO_EXTENSIONS.has(ext)) {
    return getAudioMimeType(ext);
  }
  if (TEXT_EXTENSIONS.has(ext)) {
    return getTextMimeType(ext);
  }
  if (CODE_EXTENSIONS.has(ext)) {
    return getCodeMimeType(ext);
  }
  if (DOCUMENT_EXTENSIONS.has(ext)) {
    return getDocumentMimeType(ext);
  }
  if (ARCHIVE_EXTENSIONS.has(ext)) {
    return getArchiveMimeType(ext);
  }
  if (LORA_EXTENSIONS.has(ext)) {
    return getSpecialMimeType(ext);
  }

  return "application/octet-stream";
}

/**
 * Check if a file extension is supported for processing
 */
export function isSupportedExtension(extension: string): boolean {
  const ext = extension.toLowerCase();
  return (
    IMAGE_EXTENSIONS.has(ext) ||
    VIDEO_EXTENSIONS.has(ext) ||
    AUDIO_EXTENSIONS.has(ext) ||
    TEXT_EXTENSIONS.has(ext) ||
    CODE_EXTENSIONS.has(ext) ||
    DOCUMENT_EXTENSIONS.has(ext) ||
    LORA_EXTENSIONS.has(ext)
  );
}

/**
 * Get all supported file extensions
 */
export function getAllSupportedExtensions(): Set<string> {
  return new Set([
    ...Array.from(IMAGE_EXTENSIONS),
    ...Array.from(VIDEO_EXTENSIONS),
    ...Array.from(AUDIO_EXTENSIONS),
    ...Array.from(TEXT_EXTENSIONS),
    ...Array.from(CODE_EXTENSIONS),
    ...Array.from(DOCUMENT_EXTENSIONS),
    ...Array.from(LORA_EXTENSIONS),
  ]);
}

/**
 * Get file category from extension
 */
export function getFileCategory(extension: string): string {
  const ext = extension.toLowerCase();

  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  if (CODE_EXTENSIONS.has(ext)) return "code";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "document";
  if (LORA_EXTENSIONS.has(ext)) return "lora";
  if (ARCHIVE_EXTENSIONS.has(ext)) return "archive";

  return "other";
}

/**
 * Default configuration for file processing
 */
export const DEFAULT_PROCESSING_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  timeout: 30000, // 30 seconds
  thumbnailSize: [200, 200] as [number, number],
  previewSize: [800, 800] as [number, number],
  quality: 85,
  format: "webp" as const,
};
