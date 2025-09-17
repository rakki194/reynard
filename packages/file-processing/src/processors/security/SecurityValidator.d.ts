/**
 * Security validation utilities for file processing.
 *
 * Handles file security checks including path traversal prevention,
 * dangerous file detection, and content validation.
 */
export interface SecurityValidationResult {
    isValid: boolean;
    error?: string;
}
export interface SecurityConfig {
    maxFileSize: number;
    allowedExtensions: Set<string>;
    blockedExtensions: Set<string>;
}
export declare class SecurityValidator {
    private config;
    constructor(config: SecurityConfig);
    /**
     * Validate file security for both File objects and file paths
     */
    validateFileSecurity(file: File | string): SecurityValidationResult;
    /**
     * Validate file content for security
     */
    validateFileContent(file: File): Promise<SecurityValidationResult>;
    /**
     * Validate compressed files for zip bombs
     */
    private validateCompressedFile;
    /**
     * Update security configuration
     */
    updateConfig(updates: Partial<SecurityConfig>): void;
}
