/**
 * File validation utilities for security checks.
 *
 * Handles file path and file object validation.
 */
export class FileValidator {
    /**
     * Validate file path for security issues
     */
    static validateFilePath(path) {
        // Validate file path for directory traversal
        if (path.includes("..") || path.includes("~") || path.startsWith("/")) {
            return { isValid: false, error: "Invalid file path" };
        }
        return { isValid: true };
    }
    /**
     * Validate File object for security issues
     */
    static validateFileObject(file, maxFileSize) {
        // Validate file name
        if (!file.name || file.name.length === 0) {
            return { isValid: false, error: "Invalid file name" };
        }
        // Check for dangerous file names
        const dangerousNames = [".htaccess", "web.config", "crossdomain.xml"];
        if (dangerousNames.includes(file.name.toLowerCase())) {
            return { isValid: false, error: "Dangerous file name" };
        }
        // Check for path traversal in file name
        if (file.name.includes("..") ||
            file.name.includes("/") ||
            file.name.includes("\\")) {
            return { isValid: false, error: "Invalid file name" };
        }
        // Check file size limits
        if (file.size === 0) {
            return { isValid: false, error: "Empty file" };
        }
        if (file.size > maxFileSize) {
            return { isValid: false, error: "File too large" };
        }
        return { isValid: true };
    }
    /**
     * Get file extension from filename
     */
    static getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex !== -1
            ? filename.substring(lastDotIndex).toLowerCase()
            : "";
    }
}
