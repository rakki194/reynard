/**
 * MIME type validation utilities for file security.
 *
 * Handles MIME type validation and file extension checking.
 */
export class MimeTypeValidator {
    /**
     * Check if MIME type matches extension
     */
    static isValidMimeType(extension, mimeType) {
        const expectedTypes = this.VALID_MIME_TYPES[extension.toLowerCase()];
        return !expectedTypes || expectedTypes.includes(mimeType);
    }
    /**
     * Check if file is executable
     */
    static isExecutableFile(extension) {
        return this.EXECUTABLE_EXTENSIONS.includes(extension.toLowerCase());
    }
    /**
     * Check if file is compressed
     */
    static isCompressedFile(extension) {
        return this.COMPRESSED_EXTENSIONS.includes(extension.toLowerCase());
    }
}
Object.defineProperty(MimeTypeValidator, "VALID_MIME_TYPES", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        ".jpg": ["image/jpeg"],
        ".jpeg": ["image/jpeg"],
        ".png": ["image/png"],
        ".gif": ["image/gif"],
        ".webp": ["image/webp"],
        ".svg": ["image/svg+xml"],
        ".pdf": ["application/pdf"],
        ".txt": ["text/plain"],
        ".json": ["application/json"],
        ".xml": ["application/xml", "text/xml"],
    }
});
Object.defineProperty(MimeTypeValidator, "EXECUTABLE_EXTENSIONS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: [
        ".exe",
        ".bat",
        ".cmd",
        ".com",
        ".scr",
        ".pif",
        ".msi",
        ".app",
        ".deb",
        ".rpm",
        ".dmg",
    ]
});
Object.defineProperty(MimeTypeValidator, "COMPRESSED_EXTENSIONS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: [
        ".zip",
        ".rar",
        ".7z",
        ".tar",
        ".gz",
        ".bz2",
        ".xz",
    ]
});
