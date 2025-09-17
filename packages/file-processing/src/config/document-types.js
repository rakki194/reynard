/**
 * Document file type definitions for the Reynard File Processing system.
 *
 * This module defines supported document file extensions, MIME types, and
 * processing capabilities for document files.
 */
/**
 * Supported document file extensions
 */
export const DOCUMENT_EXTENSIONS = new Set([
    // Office documents
    ".pdf",
    ".docx",
    ".doc",
    ".pptx",
    ".ppt",
    ".xlsx",
    ".xls",
    ".odt",
    ".odp",
    ".ods",
    // E-books
    ".epub",
    ".mobi",
    ".azw3",
    ".kfx",
    ".lit",
    ".prc",
    // Rich text
    ".rtf",
    ".pages",
    ".key",
    ".numbers",
    ".abw",
    ".kwd",
    ".odm",
    // Markup
    ".html",
    ".htm",
    ".xml",
    ".sgml",
    ".tex",
    ".ltx",
    ".sty",
    ".cls",
]);
/**
 * Document MIME types mapping
 */
export const DOCUMENT_MIME_TYPES = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".rtf": "application/rtf",
    ".html": "text/html",
    ".htm": "text/html",
    ".xml": "application/xml",
};
/**
 * Get MIME type for a document extension
 */
export function getDocumentMimeType(extension) {
    const ext = extension.toLowerCase();
    return DOCUMENT_MIME_TYPES[ext] || "application/octet-stream";
}
/**
 * Check if extension is a document file
 */
export function isDocumentExtension(extension) {
    return DOCUMENT_EXTENSIONS.has(extension.toLowerCase());
}
