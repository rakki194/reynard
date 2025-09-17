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
export const LORA_EXTENSIONS = new Set([
    ".safetensors",
    ".ckpt",
    ".pt",
    ".pth",
    ".bin",
    ".model",
    ".lora",
    ".lycoris",
]);
/**
 * Supported OCR file extensions (images that may contain text)
 */
export const OCR_EXTENSIONS = new Set([
    // Images that commonly contain text
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".jxl",
    ".avif",
    ".bmp",
    ".tiff",
    ".tif",
    // Scanned document formats
    ".pdf",
    // Additional image formats used for documents
    ".heic",
    ".heif",
    ".jp2",
    ".j2k",
    ".jpx",
    ".jpf",
]);
/**
 * Caption and metadata file extensions
 */
export const CAPTION_EXTENSIONS = new Set([
    ".caption",
    ".txt",
    ".tags",
    ".florence",
    ".wd",
    ".json",
    ".xml",
    ".yaml",
    ".yml",
]);
/**
 * Metadata file extensions
 */
export const METADATA_EXTENSIONS = new Set([
    ".bboxes.json",
    ".metadata.json",
    ".info.json",
    ".exif",
    ".xmp",
    ".iptc",
]);
/**
 * Special MIME types mapping
 */
export const SPECIAL_MIME_TYPES = {
    // LoRA models
    ".safetensors": "application/octet-stream",
    ".ckpt": "application/octet-stream",
    ".pt": "application/octet-stream",
    ".pth": "application/octet-stream",
    ".bin": "application/octet-stream",
};
/**
 * Get MIME type for a special extension
 */
export function getSpecialMimeType(extension) {
    const ext = extension.toLowerCase();
    return SPECIAL_MIME_TYPES[ext] || "application/octet-stream";
}
/**
 * Check if extension is a LoRA model file
 */
export function isLoRAExtension(extension) {
    return LORA_EXTENSIONS.has(extension.toLowerCase());
}
/**
 * Check if extension is an OCR-capable file
 */
export function isOCRExtension(extension) {
    return OCR_EXTENSIONS.has(extension.toLowerCase());
}
/**
 * Check if extension is a caption file
 */
export function isCaptionExtension(extension) {
    return CAPTION_EXTENSIONS.has(extension.toLowerCase());
}
/**
 * Check if extension is a metadata file
 */
export function isMetadataExtension(extension) {
    return METADATA_EXTENSIONS.has(extension.toLowerCase());
}
