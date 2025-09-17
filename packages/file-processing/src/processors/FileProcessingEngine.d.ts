/**
 * Core file processing engine for handling file operations.
 *
 * Handles the main processing logic for files including validation,
 * metadata extraction, and thumbnail generation.
 */
import { ProcessingOptions, ProcessingResult } from "../types";
import { SecurityValidator } from "./security/SecurityValidator";
import { FileTypeValidator } from "./utils/FileTypeValidator";
import { ConfigManager } from "./utils/ConfigManager";
export declare class FileProcessingEngine {
    private securityValidator;
    private fileTypeValidator;
    private configManager;
    constructor(securityValidator: SecurityValidator, fileTypeValidator: FileTypeValidator, configManager: ConfigManager);
    /**
     * Process a single file with security validation
     */
    processFile(file: File | string, options?: ProcessingOptions): Promise<ProcessingResult>;
    /**
     * Create error result
     */
    private createErrorResult;
}
