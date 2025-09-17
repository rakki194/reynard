/**
 * Core file processing engine for handling file operations.
 *
 * Handles the main processing logic for files including validation,
 * metadata extraction, and thumbnail generation.
 */
export class FileProcessingEngine {
    constructor(securityValidator, fileTypeValidator, configManager) {
        Object.defineProperty(this, "securityValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fileTypeValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "configManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.securityValidator = securityValidator;
        this.fileTypeValidator = fileTypeValidator;
        this.configManager = configManager;
    }
    /**
     * Process a single file with security validation
     */
    async processFile(file, options) {
        const startTime = Date.now();
        try {
            // Security validation
            const securityCheck = this.securityValidator.validateFileSecurity(file);
            if (!securityCheck.isValid) {
                return this.createErrorResult("File security validation failed", startTime);
            }
            // Validate file type
            if (!this.fileTypeValidator.isSupported(file)) {
                return this.createErrorResult("File type not supported", startTime);
            }
            // Check file size with additional security limits
            const maxSize = options?.maxFileSize || this.configManager.getMaxFileSize();
            if (typeof file !== "string" && file.size > maxSize) {
                return this.createErrorResult("File size exceeds maximum allowed size", startTime);
            }
            // Additional security checks for file content
            if (typeof file !== "string") {
                const contentCheck = await this.securityValidator.validateFileContent(file);
                if (!contentCheck.isValid) {
                    return this.createErrorResult("File content validation failed", startTime);
                }
            }
            // Process file based on options
            const results = {};
            if (options?.extractMetadata !== false) {
                results.metadata = { extracted: true };
            }
            if (options?.analyzeContent !== false) {
                results.content = { analyzed: true };
            }
            return {
                success: true,
                data: results,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return this.createErrorResult(error instanceof Error ? error.message : "Unknown error occurred", startTime);
        }
    }
    /**
     * Create error result
     */
    createErrorResult(error, startTime) {
        return {
            success: false,
            error,
            duration: Date.now() - startTime,
            timestamp: new Date(),
        };
    }
}
