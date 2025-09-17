/**
 * 🦊 Reynard Queue Watcher CLI
 *
 * Command-line interface for the Reynard queue-based file watcher.
 */

import { program } from "commander";
import fs from "fs";
import path from "path";
import { DEFAULT_CONFIG } from "./config.js";
import { shouldExcludeFile, wasRecentlyProcessed } from "./file-utils.js";
import { Processors } from "./processors.js";
import { queueManager } from "./queue-manager.js";
import type { FileType } from "./types.js";

// Track recently processed files to avoid excessive runs
const recentlyProcessed = new Map<string, number>();

/**
 * Process a file through the appropriate processor
 */
function processFile(filePath: string, excludePatterns: RegExp[], cooldown: number): void {
  // Check if file should be excluded
  if (shouldExcludeFile(filePath)) {
    console.log(`⏭️  Skipping excluded file: ${filePath}`);
    return;
  }

  // Check if file was recently processed
  if (wasRecentlyProcessed(filePath, recentlyProcessed, cooldown)) {
    console.log(`⏭️  Skipping recently processed file: ${filePath}`);
    return;
  }

  // Get file type and process accordingly
  const ext = path.extname(filePath).toLowerCase();
  let fileType: FileType | null = null;

  switch (ext) {
    case '.md':
    case '.mdx':
      fileType = 'markdown';
      break;
    case '.ts':
    case '.tsx':
      fileType = 'typescript';
      break;
    case '.js':
    case '.jsx':
      fileType = 'javascript';
      break;
    case '.py':
      fileType = 'python';
      break;
    case '.json':
      fileType = 'json';
      break;
    case '.yaml':
    case '.yml':
      fileType = 'yaml';
      break;
    case '.css':
      fileType = 'css';
      break;
    case '.html':
    case '.htm':
      fileType = 'html';
      break;
    default:
      console.log(`⏭️  Skipping unsupported file type: ${filePath}`);
      return;
  }

  if (fileType) {
    console.log(`🔄 Processing ${fileType} file: ${filePath}`);
    // For now, just use the waitForStable processor for all file types
    queueManager.enqueueFile(filePath, [Processors.waitForStable], { fileType });
  }
}

/**
 * Set up file watchers for the specified directories
 */
function setupFileWatchers(watchDirectories: string[], excludePatterns: RegExp[], cooldown: number): void {
  watchDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`👀 Watching directory: ${dir}`);

      try {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (filename && eventType === "change") {
            const filePath = path.join(dir, filename);

            // Only process on file changes (not deletions)
            if (fs.existsSync(filePath)) {
              console.log(`📝 File ${eventType}: ${filePath}`);
              processFile(filePath, excludePatterns, cooldown);
            }
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to watch directory ${dir}:`, errorMessage);
      }
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  });
}

/**
 * Set up status reporting for the queue
 */
function setupStatusReporting(interval: number): void {
  setInterval(() => {
    const status = queueManager.getStatus();
    console.log(`📊 Queue Status: ${status.totalQueues} total queues, ${status.processingFiles.length} processing, processing: ${status.isProcessing}`);
  }, interval);
}

// CLI setup
program
  .name('reynard-queue-watcher')
  .description('🦊 Reynard Queue-Based File Watcher')
  .version('1.0.0');

program
  .option('-d, --directories <dirs...>', 'Directories to watch', DEFAULT_CONFIG.watchDirectories)
  .option('-c, --cooldown <ms>', 'Processing cooldown in milliseconds', DEFAULT_CONFIG.processingCooldown.toString())
  .option('-i, --interval <ms>', 'Status report interval in milliseconds', DEFAULT_CONFIG.statusReportInterval.toString())
  .action((options) => {
    const config = {
      watchDirectories: options.directories,
      excludePatterns: DEFAULT_CONFIG.excludePatterns,
      processingCooldown: parseInt(options.cooldown),
      statusReportInterval: parseInt(options.interval)
    };

    console.log("🦊 Starting Reynard Queue Watcher...");
    console.log(`📁 Watching directories: ${config.watchDirectories.join(', ')}`);
    console.log(`⏱️  Processing cooldown: ${config.processingCooldown}ms`);
    console.log(`📊 Status interval: ${config.statusReportInterval}ms`);

    // Set up file watchers
    setupFileWatchers(config.watchDirectories, config.excludePatterns, config.processingCooldown);

    // Set up status reporting
    setupStatusReporting(config.statusReportInterval);

    console.log("✅ Queue watcher is running. Press Ctrl+C to stop.");

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log("\n🛑 Shutting down queue watcher...");
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log("\n🛑 Shutting down queue watcher...");
      process.exit(0);
    });
  });

program.parse();