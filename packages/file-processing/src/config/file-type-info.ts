/**
 * File type information resolution for the Reynard File Processing system.
 *
 * This module handles the logic for determining file type information,
 * capabilities, and processing support based on file extensions.
 */

import { FileTypeInfo } from "../types";
import { getMimeType } from "./mime-type-resolver";
import { FILE_TYPE_CONFIGS } from "./file-type-configs";

/**
 * Resolve capability values (handle both static and function values)
 */
function resolveCapabilities(capabilities: any, ext: string) {
  return {
    thumbnail: typeof capabilities.thumbnail === "function" 
      ? capabilities.thumbnail(ext) 
      : capabilities.thumbnail,
    metadata: typeof capabilities.metadata === "function" 
      ? capabilities.metadata(ext) 
      : capabilities.metadata,
    content: typeof capabilities.content === "function" 
      ? capabilities.content(ext) 
      : capabilities.content,
    ocr: typeof capabilities.ocr === "function" 
      ? capabilities.ocr(ext) 
      : capabilities.ocr,
  };
}

/**
 * Get file type information for a given extension
 */
export function getFileTypeInfo(extension: string): FileTypeInfo {
  const ext = extension.toLowerCase();

  for (const config of FILE_TYPE_CONFIGS) {
    if (config.extensions.has(ext)) {
      return {
        extension: ext,
        mimeType: getMimeType(ext),
        category: config.category,
        isSupported: config.isSupported,
        capabilities: resolveCapabilities(config.capabilities, ext),
      };
    }
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
