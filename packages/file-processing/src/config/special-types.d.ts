/**
 * Special file type definitions for the Reynard File Processing system.
 *
 * This module defines supported special file extensions, MIME types, and
 * processing capabilities for specialized file types like LoRA models,
 * OCR files, captions, and metadata.
 */
/**
 * Supported LoRA model file extensions
 */
export declare const LORA_EXTENSIONS: Set<string>;
/**
 * Supported OCR file extensions (images that may contain text)
 */
export declare const OCR_EXTENSIONS: Set<string>;
/**
 * Caption and metadata file extensions
 */
export declare const CAPTION_EXTENSIONS: Set<string>;
/**
 * Metadata file extensions
 */
export declare const METADATA_EXTENSIONS: Set<string>;
/**
 * Special MIME types mapping
 */
export declare const SPECIAL_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for a special extension
 */
export declare function getSpecialMimeType(extension: string): string;
/**
 * Check if extension is a LoRA model file
 */
export declare function isLoRAExtension(extension: string): boolean;
/**
 * Check if extension is an OCR-capable file
 */
export declare function isOCRExtension(extension: string): boolean;
/**
 * Check if extension is a caption file
 */
export declare function isCaptionExtension(extension: string): boolean;
/**
 * Check if extension is a metadata file
 */
export declare function isMetadataExtension(extension: string): boolean;
