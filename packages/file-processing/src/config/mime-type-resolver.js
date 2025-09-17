/**
 * MIME type resolution for the Reynard File Processing system.
 *
 * This module handles the logic for determining MIME types based on
 * file extensions across different file categories.
 */
import { getImageMimeType } from "./image-types";
import { getVideoMimeType } from "./video-types";
import { getAudioMimeType } from "./audio-types";
import { getTextMimeType } from "./text-types";
import { getCodeMimeType } from "./code-types";
import { getDocumentMimeType } from "./document-types";
import { getArchiveMimeType } from "./archive-types";
import { getSpecialMimeType } from "./special-types";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, TEXT_EXTENSIONS, CODE_EXTENSIONS, DOCUMENT_EXTENSIONS, ARCHIVE_EXTENSIONS, LORA_EXTENSIONS, } from "./file-types";
/**
 * Get MIME type for a file extension
 */
export function getMimeType(extension) {
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
