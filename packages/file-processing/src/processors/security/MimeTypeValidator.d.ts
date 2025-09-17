/**
 * MIME type validation utilities for file security.
 *
 * Handles MIME type validation and file extension checking.
 */
export declare class MimeTypeValidator {
    private static readonly VALID_MIME_TYPES;
    private static readonly EXECUTABLE_EXTENSIONS;
    private static readonly COMPRESSED_EXTENSIONS;
    /**
     * Check if MIME type matches extension
     */
    static isValidMimeType(extension: string, mimeType: string): boolean;
    /**
     * Check if file is executable
     */
    static isExecutableFile(extension: string): boolean;
    /**
     * Check if file is compressed
     */
    static isCompressedFile(extension: string): boolean;
}
