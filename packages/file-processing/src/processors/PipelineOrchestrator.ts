/**
 * Pipeline orchestrator for coordinating file processing operations.
 * 
 * Handles the coordination between different processing modules.
 */

import {
  ProcessingOptions,
  ProcessingResult,
  ThumbnailOptions,
  DirectoryListing,
  FileTypeInfo,
  ProcessingProgress,
  ProcessingConfig,
} from "../types";
import { FileProcessor } from "./FileProcessor";
import { ProgressManager } from "./utils/ProgressManager";
import { ConfigManager } from "./utils/ConfigManager";
import { FileTypeValidator } from "./utils/FileTypeValidator";
import { DirectoryScanner } from "./DirectoryScanner";

export class PipelineOrchestrator {
  private fileProcessor: FileProcessor;
  private progressManager: ProgressManager;
  private configManager: ConfigManager;
  private fileTypeValidator: FileTypeValidator;
  private directoryScanner: DirectoryScanner;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.progressManager = new ProgressManager();
    this.fileTypeValidator = new FileTypeValidator(
      configManager.getSupportedExtensions(),
    );
    this.directoryScanner = new DirectoryScanner();
    this.fileProcessor = new FileProcessor(configManager);
  }

  /**
   * Process multiple files with progress tracking
   */
  async processFiles(
    files: (File | string)[],
    options?: ProcessingOptions,
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      this.progressManager.updateProgress(
        this.progressManager.createFileProgress(
          "Processing files",
          i,
          totalFiles,
          typeof file === "string" ? file : file.name,
        ),
      );

      try {
        const result = await this.fileProcessor.processFile(file, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
          duration: 0,
          timestamp: new Date(),
        });
      }
    }

    this.progressManager.updateProgress(
      this.progressManager.createCompletionProgress("Processing files", totalFiles),
    );

    return results;
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): FileTypeInfo[] {
    return Array.from(this.fileTypeValidator.getAllSupportedExtensions()).map((ext) =>
      this.fileTypeValidator.getFileTypeInfo(ext),
    );
  }

  /**
   * Check if file type is supported
   */
  isSupported(file: File | string): boolean {
    return this.fileTypeValidator.isSupported(file);
  }

  /**
   * Get progress manager
   */
  getProgressManager(): ProgressManager {
    return this.progressManager;
  }

  /**
   * Get file processor
   */
  getFileProcessor(): FileProcessor {
    return this.fileProcessor;
  }

  /**
   * Get directory scanner
   */
  getDirectoryScanner(): DirectoryScanner {
    return this.directoryScanner;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ProcessingConfig>): void {
    this.configManager.updateConfig(updates);
    this.fileProcessor.updateConfig(updates);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.fileProcessor.destroy();
    this.progressManager.clearCallbacks();
  }
}
