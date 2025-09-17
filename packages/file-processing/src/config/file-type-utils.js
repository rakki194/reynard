/**
 * Utility functions for file type operations in the Reynard File Processing system.
 *
 * This module provides helper functions for checking file support,
 * getting categories, and managing file type collections.
 */
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, TEXT_EXTENSIONS, CODE_EXTENSIONS, DOCUMENT_EXTENSIONS, ARCHIVE_EXTENSIONS, LORA_EXTENSIONS, } from "./file-types";
/**
 * Check if a file extension is supported for processing
 */
export function isSupportedExtension(extension) {
    const ext = extension.toLowerCase();
    return (IMAGE_EXTENSIONS.has(ext) ||
        VIDEO_EXTENSIONS.has(ext) ||
        AUDIO_EXTENSIONS.has(ext) ||
        TEXT_EXTENSIONS.has(ext) ||
        CODE_EXTENSIONS.has(ext) ||
        DOCUMENT_EXTENSIONS.has(ext) ||
        LORA_EXTENSIONS.has(ext));
}
/**
 * Get all supported file extensions
 */
export function getAllSupportedExtensions() {
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
export function getFileCategory(extension) {
    const ext = extension.toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext))
        return "image";
    if (VIDEO_EXTENSIONS.has(ext))
        return "video";
    if (AUDIO_EXTENSIONS.has(ext))
        return "audio";
    if (TEXT_EXTENSIONS.has(ext))
        return "text";
    if (CODE_EXTENSIONS.has(ext))
        return "code";
    if (DOCUMENT_EXTENSIONS.has(ext))
        return "document";
    if (LORA_EXTENSIONS.has(ext))
        return "lora";
    if (ARCHIVE_EXTENSIONS.has(ext))
        return "archive";
    return "other";
}
