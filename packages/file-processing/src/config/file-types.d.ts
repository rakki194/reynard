/**
 * File type configuration for the Reynard File Processing system.
 *
 * This module aggregates supported file extensions, MIME types, and processing
 * capabilities for different file categories from specialized modules.
 */
import { IMAGE_EXTENSIONS } from "./image-types";
import { VIDEO_EXTENSIONS } from "./video-types";
import { AUDIO_EXTENSIONS } from "./audio-types";
import { TEXT_EXTENSIONS } from "./text-types";
import { CODE_EXTENSIONS } from "./code-types";
import { DOCUMENT_EXTENSIONS } from "./document-types";
import { ARCHIVE_EXTENSIONS } from "./archive-types";
import { LORA_EXTENSIONS, OCR_EXTENSIONS, CAPTION_EXTENSIONS, METADATA_EXTENSIONS } from "./special-types";
import "./file-type-info";
import "./file-type-configs";
import "./mime-type-resolver";
import "./file-type-utils";
import "./processing-config";
export { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, TEXT_EXTENSIONS, CODE_EXTENSIONS, DOCUMENT_EXTENSIONS, ARCHIVE_EXTENSIONS, LORA_EXTENSIONS, OCR_EXTENSIONS, CAPTION_EXTENSIONS, METADATA_EXTENSIONS, };
export { getFileTypeInfo } from "./file-type-info";
export { getMimeType } from "./mime-type-resolver";
export { isSupportedExtension, getAllSupportedExtensions, getFileCategory, } from "./file-type-utils";
export { DEFAULT_PROCESSING_CONFIG } from "./processing-config";
