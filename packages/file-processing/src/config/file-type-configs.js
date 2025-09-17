/**
 * File type configuration definitions for the Reynard File Processing system.
 *
 * This module defines the configuration mappings for different file types
 * and their processing capabilities.
 */
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, TEXT_EXTENSIONS, CODE_EXTENSIONS, DOCUMENT_EXTENSIONS, ARCHIVE_EXTENSIONS, LORA_EXTENSIONS, OCR_EXTENSIONS, } from "./file-types";
/**
 * File type configuration mapping
 */
export const FILE_TYPE_CONFIGS = [
    {
        extensions: IMAGE_EXTENSIONS,
        category: "image",
        isSupported: true,
        capabilities: {
            thumbnail: true,
            metadata: true,
            content: true,
            ocr: (ext) => OCR_EXTENSIONS.has(ext),
        },
    },
    {
        extensions: VIDEO_EXTENSIONS,
        category: "video",
        isSupported: true,
        capabilities: {
            thumbnail: true,
            metadata: true,
            content: false,
            ocr: false,
        },
    },
    {
        extensions: AUDIO_EXTENSIONS,
        category: "audio",
        isSupported: true,
        capabilities: {
            thumbnail: true,
            metadata: true,
            content: false,
            ocr: false,
        },
    },
    {
        extensions: TEXT_EXTENSIONS,
        category: "text",
        isSupported: true,
        capabilities: {
            thumbnail: true,
            metadata: true,
            content: true,
            ocr: false,
        },
    },
    {
        extensions: CODE_EXTENSIONS,
        category: "code",
        isSupported: true,
        capabilities: {
            thumbnail: true,
            metadata: true,
            content: true,
            ocr: false,
        },
    },
    {
        extensions: DOCUMENT_EXTENSIONS,
        category: "document",
        isSupported: true,
        capabilities: {
            thumbnail: true,
            metadata: true,
            content: (ext) => ext === ".pdf" || ext === ".txt",
            ocr: true,
        },
    },
    {
        extensions: LORA_EXTENSIONS,
        category: "other",
        isSupported: true,
        capabilities: {
            thumbnail: false,
            metadata: true,
            content: false,
            ocr: false,
        },
    },
    {
        extensions: ARCHIVE_EXTENSIONS,
        category: "archive",
        isSupported: false,
        capabilities: {
            thumbnail: false,
            metadata: true,
            content: false,
            ocr: false,
        },
    },
];
