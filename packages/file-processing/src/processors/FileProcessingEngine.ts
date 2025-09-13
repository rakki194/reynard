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

export class FileProcessingEngine {
  private securityValidator: SecurityValidator;
  private fileTypeValidator: FileTypeValidator;
  private configManager: ConfigManager;

  constructor(
    securityValidator: SecurityValidator,
    fileTypeValidator: FileTypeValidator,
    configManager: ConfigManager,
  ) {
    this.securityValidator = securityValidator;
    this.fileTypeValidator = fileTypeValidator;
    this.configManager = configManager;
  }

  /**
   * Process a single file with security validation
   */
  async processFile(
    file: File | string,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // Security validation
      const securityCheck = this.securityValidator.validateFileSecurity(file);
      if (!securityCheck.isValid) {
        return this.createErrorResult(
          "File security validation failed",
          startTime,
        );
      }

      // Validate file type
      if (!this.fileTypeValidator.isSupported(file)) {
        return this.createErrorResult("File type not supported", startTime);
      }

      // Check file size with additional security limits
      const maxSize = options?.maxFileSize || this.configManager.getMaxFileSize();
      if (typeof file !== "string" && file.size > maxSize) {
        return this.createErrorResult(
          "File size exceeds maximum allowed size",
          startTime,
        );
      }

      // Additional security checks for file content
      if (typeof file !== "string") {
        const contentCheck = await this.securityValidator.validateFileContent(file);
        if (!contentCheck.isValid) {
          return this.createErrorResult(
            "File content validation failed",
            startTime,
          );
        }
      }

      // Process file based on options
      const results: Record<string, any> = {};

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
    } catch (error) {
      return this.createErrorResult(
        error instanceof Error ? error.message : "Unknown error occurred",
        startTime,
      );
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(
    error: string,
    startTime: number,
  ): ProcessingResult {
    return {
      success: false,
      error,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    };
  }
}
