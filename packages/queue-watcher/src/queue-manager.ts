#!/usr/bin/env node

/**
 * 🦊 Reynard File Processing Queue Manager (TypeScript)
 *
 * This module provides a queue-based file processing system that ensures
 * all validators and formatters run in perfect sequence for each file,
 * eliminating race conditions and ensuring consistent results.
 */

import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import type { FileProcessor, ProcessingOptions, ProcessorEntry, QueueStatus } from "./types.js";

// Colors for terminal output (matching Reynard style)
const Colors = {
  RED: "\u001b[0;31m",
  GREEN: "\u001b[0;32m",
  YELLOW: "\u001b[1;33m",
  BLUE: "\u001b[0;34m",
  PURPLE: "\u001b[0;35m",
  CYAN: "\u001b[0;36m",
  WHITE: "\u001b[1;37m",
  NC: "\u001b[0m", // No Color
} as const;

function printColored(message: string, color: string = Colors.NC): void {
  console.log(`${color}${message}${Colors.NC}`);
}

/**
 * Individual file processing queue
 */
class FileQueue {
  private readonly filePath: string;
  private readonly manager: FileQueueManager;
  private readonly processors: ProcessorEntry[] = [];
  private isProcessing: boolean = false;

  constructor(filePath: string, manager: FileQueueManager) {
    this.filePath = filePath;
    this.manager = manager;
  }

  /**
   * Add a processor to this file's queue
   * @param processor - Processor function
   * @param options - Processor options
   */
  addProcessor(processor: FileProcessor, options: ProcessingOptions = {}): void {
    this.processors.push({
      processor,
      options,
      addedAt: Date.now(),
    });
  }

  /**
   * Process all pending processors for this file
   */
  async process(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    printColored(`🦊 Processing queue for: ${this.filePath}`, Colors.PURPLE);

    try {
      while (this.processors.length > 0) {
        const processorEntry = this.processors.shift();
        if (!processorEntry) break;

        const { processor, options } = processorEntry;
        const processorName = processor.name || "anonymous";

        printColored(`  🔄 Running processor: ${processorName}`, Colors.CYAN);

        try {
          await processor(this.filePath, options);
          printColored(`  ✅ Completed: ${processorName}`, Colors.GREEN);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          printColored(`  ❌ Failed: ${processorName} - ${errorMessage}`, Colors.RED);
          // Continue with next processor even if one fails
        }

        // Small delay between processors
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      printColored(`✅ Queue completed for: ${this.filePath}`, Colors.GREEN);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if there are pending processors
   */
  hasPendingProcessors(): boolean {
    return this.processors.length > 0;
  }

  /**
   * Get count of pending processors
   */
  getPendingCount(): number {
    return this.processors.length;
  }
}

/**
 * File Processing Queue Manager
 * Manages individual queues for each file to prevent race conditions
 */
export class FileQueueManager extends EventEmitter {
  private readonly fileQueues = new Map<string, FileQueue>();
  private readonly processingFiles = new Set<string>();
  private readonly globalQueue: string[] = [];
  private isProcessing: boolean = false;
  private autoStart: boolean = true;

  /**
   * Add a file to the processing queue
   * @param filePath - Path to the file to process
   * @param processors - Array of processor functions
   * @param options - Processing options
   */
  enqueueFile(filePath: string, processors: FileProcessor[] = [], options: ProcessingOptions = {}): void {
    const normalizedPath = path.resolve(filePath);

    // Skip if file doesn't exist
    if (!fs.existsSync(normalizedPath)) {
      printColored(`⚠️  File not found: ${normalizedPath}`, Colors.YELLOW);
      return;
    }

    // Skip if already processing
    if (this.processingFiles.has(normalizedPath)) {
      printColored(`⏭️  File already processing: ${normalizedPath}`, Colors.CYAN);
      return;
    }

    // Get or create queue for this file
    if (!this.fileQueues.has(normalizedPath)) {
      this.fileQueues.set(normalizedPath, new FileQueue(normalizedPath, this));
    }

    const fileQueue = this.fileQueues.get(normalizedPath);
    if (!fileQueue) {
      printColored(`❌ Failed to create queue for: ${normalizedPath}`, Colors.RED);
      return;
    }

    // Add processors to the file's queue
    processors.forEach(processor => {
      fileQueue.addProcessor(processor, options);
    });

    // Start processing if not already running and auto-start is enabled
    if (this.autoStart) {
      this.startProcessing();
    }
  }

  /**
   * Start processing files in the global queue
   */
  startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processNextFile();
  }

  /**
   * Set whether to automatically start processing when files are enqueued
   * @param autoStart - Whether to auto-start processing
   */
  setAutoStart(autoStart: boolean): void {
    this.autoStart = autoStart;
  }

  /**
   * Process all files synchronously (for testing)
   */
  async processAll(): Promise<void> {
    while (this.isProcessing || this.hasPendingFiles()) {
      await this.processNextFileSync();
    }
    // Clean up completed queues after processing
    this.cleanup();
  }

  /**
   * Check if there are any files with pending processors
   */
  private hasPendingFiles(): boolean {
    for (const fileQueue of this.fileQueues.values()) {
      if (fileQueue.hasPendingProcessors()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Process the next file synchronously (for testing)
   */
  private async processNextFileSync(): Promise<void> {
    // Find the next file that's ready to process
    for (const [filePath, fileQueue] of this.fileQueues) {
      if (!this.processingFiles.has(filePath) && fileQueue.hasPendingProcessors()) {
        this.processingFiles.add(filePath);

        try {
          await fileQueue.process();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          printColored(`❌ Error processing ${filePath}: ${errorMessage}`, Colors.RED);
        } finally {
          this.processingFiles.delete(filePath);
        }

        return;
      }
    }

    // No more files to process
    this.isProcessing = false;
  }

  /**
   * Process the next file in the global queue
   */
  private async processNextFile(): Promise<void> {
    // Find the next file that's ready to process
    for (const [filePath, fileQueue] of this.fileQueues) {
      if (!this.processingFiles.has(filePath) && fileQueue.hasPendingProcessors()) {
        this.processingFiles.add(filePath);

        try {
          await fileQueue.process();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          printColored(`❌ Error processing ${filePath}: ${errorMessage}`, Colors.RED);
        } finally {
          this.processingFiles.delete(filePath);
        }

        // Continue processing
        setTimeout(() => this.processNextFile(), 0);
        return;
      }
    }

    // No more files to process
    this.isProcessing = false;
  }

  /**
   * Get queue status for debugging
   */
  getStatus(): QueueStatus {
    const status: QueueStatus = {
      totalQueues: this.fileQueues.size,
      processingFiles: Array.from(this.processingFiles),
      isProcessing: this.isProcessing,
      queueDetails: {},
    };

    for (const [filePath, fileQueue] of this.fileQueues) {
      status.queueDetails[filePath] = {
        pendingProcessors: fileQueue.getPendingCount(),
        isProcessing: this.processingFiles.has(filePath),
      };
    }

    return status;
  }

  /**
   * Clean up completed queues
   */
  cleanup(): void {
    for (const [filePath, fileQueue] of this.fileQueues) {
      if (!fileQueue.hasPendingProcessors() && !this.processingFiles.has(filePath)) {
        this.fileQueues.delete(filePath);
      }
    }
  }
}

/**
 * Create a new queue manager instance
 */
export function createQueueManager(): FileQueueManager {
  return new FileQueueManager();
}

/**
 * Default queue manager instance
 */
export const queueManager = createQueueManager();

// Clean up completed queues every 30 seconds
setInterval(() => {
  queueManager.cleanup();
}, 30000);

// Export as named export instead of default
export { queueManager as default };
