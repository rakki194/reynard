/**
 * Main Processing Pipeline for the Reynard File Processing system.
 *
 * This module orchestrates all file processing operations including
 * thumbnail generation, metadata extraction, and content analysis.
 */

import {
  ProcessingPipeline,
  ProcessingOptions,
  ProcessingResult,
  ThumbnailOptions,
  DirectoryListing,
  FileTypeInfo,
  ProcessingProgress,
  ProcessingConfig,
} from "./types";
import { PipelineOrchestrator } from "./processors/PipelineOrchestrator";
import { ConfigManager } from "./processors/utils/ConfigManager";
import { getAllSupportedExtensions } from "./config/file-types";

export class FileProcessingPipeline implements ProcessingPipeline {
  private orchestrator: PipelineOrchestrator;
  private configManager: ConfigManager;

  constructor(config?: Partial<ProcessingConfig>) {
    this.configManager = new ConfigManager({
      ...config,
      supportedExtensions: Array.from(getAllSupportedExtensions()),
    });
    this.orchestrator = new PipelineOrchestrator(this.configManager);
  }

  /**
   * Process a single file with security validation
   */
  async processFile(
    file: File | string,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult> {
    return await this.orchestrator.getFileProcessor().processFile(file, options);
  }

  /**
   * Process multiple files
   */
  async processFiles(
    files: (File | string)[],
    options?: ProcessingOptions,
  ): Promise<ProcessingResult[]> {
    return await this.orchestrator.processFiles(files, options);
  }

  /**
   * Generate thumbnail for a file
   */
  async generateThumbnail(
    file: File | string,
    options: ThumbnailOptions,
  ): Promise<ProcessingResult<Blob | string>> {
    return await this.orchestrator.getFileProcessor().generateThumbnail(file, options);
  }

  /**
   * Extract metadata from a file
   */
  async extractMetadata(file: File | string): Promise<ProcessingResult> {
    return await this.orchestrator.getFileProcessor().extractMetadata(file);
  }

  /**
   * Scan directory contents
   */
  async scanDirectory(
    path: string,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult<DirectoryListing>> {
    return await this.orchestrator.getDirectoryScanner().scanDirectory(path, options);
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): FileTypeInfo[] {
    return this.orchestrator.getSupportedTypes();
  }

  /**
   * Check if file type is supported
   */
  isSupported(file: File | string): boolean {
    return this.orchestrator.isSupported(file);
  }

  /**
   * Add progress callback
   */
  onProgress(callback: (progress: ProcessingProgress) => void): void {
    this.orchestrator.getProgressManager().onProgress(callback);
  }

  /**
   * Remove progress callback
   */
  offProgress(callback: (progress: ProcessingProgress) => void): void {
    this.orchestrator.getProgressManager().offProgress(callback);
  }

  /**
   * Get current configuration
   */
  getConfig(): ProcessingConfig {
    return this.configManager.getConfig();
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ProcessingConfig>): void {
    this.orchestrator.updateConfig(updates);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.orchestrator.destroy();
  }
}
