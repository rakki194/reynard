/**
 * Security validation utilities for file processing.
 *
 * Handles file security checks including path traversal prevention,
 * dangerous file detection, and content validation.
 */
import { MimeTypeValidator } from "./MimeTypeValidator";
import { FileValidator } from "./FileValidator";
export class SecurityValidator {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = config;
    }
    /**
     * Validate file security for both File objects and file paths
     */
    validateFileSecurity(file) {
        if (typeof file === "string") {
            return FileValidator.validateFilePath(file);
        }
        else {
            return FileValidator.validateFileObject(file, this.config.maxFileSize);
        }
    }
    /**
     * Validate file content for security
     */
    async validateFileContent(file) {
        try {
            const extension = FileValidator.getFileExtension(file.name);
            const mimeType = file.type;
            // Basic MIME type validation
            if (mimeType && !MimeTypeValidator.isValidMimeType(extension, mimeType)) {
                return { isValid: false, error: "File type mismatch" };
            }
            // Check for executable content in non-executable files
            if (MimeTypeValidator.isExecutableFile(extension)) {
                return { isValid: false, error: "Executable files not allowed" };
            }
            // Check for zip bombs and other compression attacks
            if (MimeTypeValidator.isCompressedFile(extension)) {
                const compressionCheck = await this.validateCompressedFile(file);
                if (!compressionCheck.isValid) {
                    return compressionCheck;
                }
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, error: "Content validation failed" };
        }
    }
    /**
     * Validate compressed files for zip bombs
     */
    async validateCompressedFile(file) {
        // Basic validation - in a real implementation, you'd want to:
        // 1. Check compression ratio
        // 2. Validate file structure
        // 3. Check for nested archives
        // 4. Limit decompression size
        if (file.size > 50 * 1024 * 1024) {
            // 50MB limit for compressed files
            return { isValid: false, error: "Compressed file too large" };
        }
        return { isValid: true };
    }
    /**
     * Update security configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
}
