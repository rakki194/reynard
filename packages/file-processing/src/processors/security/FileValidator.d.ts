/**
 * File validation utilities for security checks.
 *
 * Handles file path and file object validation.
 */
export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}
export declare class FileValidator {
    /**
     * Validate file path for security issues
     */
    static validateFilePath(path: string): FileValidationResult;
    /**
     * Validate File object for security issues
     */
    static validateFileObject(file: File, maxFileSize: number): FileValidationResult;
    /**
     * Get file extension from filename
     */
    static getFileExtension(filename: string): string;
}
