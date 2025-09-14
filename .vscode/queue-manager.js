#!/usr/bin/env node

/**
 * 🦊 Reynard File Processing Queue Manager
 *
 * This module provides a queue-based file processing system that ensures
 * all validators and formatters run in perfect sequence for each file,
 * eliminating race conditions and ensuring consistent results.
 */

import { EventEmitter } from "events";
import fs from "fs";
import path from "path";

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
};

function printColored(message, color = Colors.NC) {
  console.log(`${color}${message}${Colors.NC}`);
}

/**
 * File Processing Queue Manager
 * Manages individual queues for each file to prevent race conditions
 */
class FileQueueManager extends EventEmitter {
  constructor() {
    super();
    this.fileQueues = new Map(); // filePath -> Queue
    this.processingFiles = new Set(); // Currently processing files
    this.globalQueue = []; // Global queue for new files
    this.isProcessing = false;
  }

  /**
   * Add a file to the processing queue
   * @param {string} filePath - Path to the file to process
   * @param {Array} processors - Array of processor functions
   * @param {Object} options - Processing options
   */
  enqueueFile(filePath, processors = [], options = {}) {
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

    // Add processors to the file's queue
    processors.forEach(processor => {
      fileQueue.addProcessor(processor, options);
    });

    // Start processing if not already running
    this.startProcessing();
  }

  /**
   * Start processing files in the global queue
   */
  startProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processNextFile();
  }

  /**
   * Process the next file in the global queue
   */
  async processNextFile() {
    // Find the next file that's ready to process
    for (const [filePath, fileQueue] of this.fileQueues) {
      if (!this.processingFiles.has(filePath) && fileQueue.hasPendingProcessors()) {
        this.processingFiles.add(filePath);

        try {
          await fileQueue.process();
        } catch (error) {
          printColored(`❌ Error processing ${filePath}: ${error.message}`, Colors.RED);
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
  getStatus() {
    const status = {
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
  cleanup() {
    for (const [filePath, fileQueue] of this.fileQueues) {
      if (!fileQueue.hasPendingProcessors() && !this.processingFiles.has(filePath)) {
        this.fileQueues.delete(filePath);
      }
    }
  }
}

/**
 * Individual file processing queue
 */
class FileQueue {
  constructor(filePath, manager) {
    this.filePath = filePath;
    this.manager = manager;
    this.processors = [];
    this.isProcessing = false;
  }

  /**
   * Add a processor to this file's queue
   * @param {Function} processor - Processor function
   * @param {Object} options - Processor options
   */
  addProcessor(processor, options = {}) {
    this.processors.push({
      processor,
      options,
      addedAt: Date.now(),
    });
  }

  /**
   * Process all pending processors for this file
   */
  async process() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    printColored(`🦊 Processing queue for: ${this.filePath}`, Colors.PURPLE);

    try {
      while (this.processors.length > 0) {
        const { processor, options } = this.processors.shift();

        printColored(`  🔄 Running processor: ${processor.name || "anonymous"}`, Colors.CYAN);

        try {
          await processor(this.filePath, options);
          printColored(`  ✅ Completed: ${processor.name || "anonymous"}`, Colors.GREEN);
        } catch (error) {
          printColored(`  ❌ Failed: ${processor.name || "anonymous"} - ${error.message}`, Colors.RED);
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
  hasPendingProcessors() {
    return this.processors.length > 0;
  }

  /**
   * Get count of pending processors
   */
  getPendingCount() {
    return this.processors.length;
  }
}

/**
 * Predefined processor functions for common tasks
 */
export const Processors = {
  /**
   * Wait for file to be stable (not being written to)
   */
  async waitForStable(filePath, options = {}) {
    const delay = options.delay || 500;
    printColored(`  ⏳ Waiting ${delay}ms for file to stabilize...`, Colors.YELLOW);
    await new Promise(resolve => setTimeout(resolve, delay));
  },

  /**
   * Run sentence length validation
   */
  async validateSentenceLength(filePath) {
    const { execSync } = await import("child_process");
    execSync(`node scripts/validation/markdown/validate-sentence-length.js --fix "${filePath}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  },

  /**
   * Run ToC validation (if needed)
   */
  async validateToC(filePath) {
    const { execSync } = await import("child_process");
    execSync(`node scripts/validation/markdown/validate-markdown-toc.js --fix "${filePath}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  },

  /**
   * Run link validation
   */
  async validateLinks(filePath) {
    const { execSync } = await import("child_process");
    execSync(`node scripts/validation/markdown/validate-markdown-links.js "${filePath}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  },

  /**
   * Run Prettier formatting
   */
  async formatWithPrettier(filePath) {
    const { execSync } = await import("child_process");
    try {
      execSync(`npx prettier --write "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      printColored(`  ⚠️  Prettier not available or failed: ${error.message}`, Colors.YELLOW);
    }
  },

  /**
   * Run ESLint fix
   */
  async fixWithESLint(filePath) {
    const { execSync } = await import("child_process");
    try {
      execSync(`npx eslint --fix "${filePath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      printColored(`  ⚠️  ESLint not available or failed: ${error.message}`, Colors.YELLOW);
    }
  },

  /**
   * Run Python validation
   */
  async validatePython(filePath) {
    const { execSync } = await import("child_process");
    execSync(`python3 scripts/validate_python.py "${filePath}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  },
};

/**
 * Create a new queue manager instance
 */
export function createQueueManager() {
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

export default queueManager;
