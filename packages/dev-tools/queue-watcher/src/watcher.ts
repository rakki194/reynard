/**
 * 🦊 Reynard Queue Watcher Core
 *
 * Core file watching functionality for the queue watcher system.
 */

import fs from "fs";
import path from "path";
import { WATCH_DIRECTORIES } from "./config.js";
import { shouldExcludeFile, wasRecentlyProcessed } from "./file-utils.js";
import { queueManager } from "./queue-manager.js";
import { Processors } from "./processors.js";
import type { FileType } from "./types.js";

// Track recently processed files to avoid excessive runs
const recentlyProcessed = new Map<string, number>();
const PROCESSING_COOLDOWN = 2000; // 2 seconds

/**
 * Process a file through the appropriate processor
 * @param filePath - Path to the file to process
 */
function processFile(filePath: string): void {
  // Check if file should be excluded
  if (shouldExcludeFile(filePath)) {
    console.log(`⏭️  Skipping excluded file: ${filePath}`);
    return;
  }

  // Check if file was recently processed
  if (wasRecentlyProcessed(filePath, recentlyProcessed, PROCESSING_COOLDOWN)) {
    console.log(`⏭️  Skipping recently processed file: ${filePath}`);
    return;
  }

  // Get file type and process accordingly
  const ext = path.extname(filePath).toLowerCase();
  let fileType: FileType | null = null;

  switch (ext) {
    case ".md":
    case ".mdx":
      fileType = "markdown";
      break;
    case ".ts":
    case ".tsx":
      fileType = "typescript";
      break;
    case ".js":
    case ".jsx":
      fileType = "javascript";
      break;
    case ".py":
      fileType = "python";
      break;
    case ".json":
      fileType = "json";
      break;
    case ".yaml":
    case ".yml":
      fileType = "yaml";
      break;
    case ".css":
      fileType = "css";
      break;
    case ".html":
    case ".htm":
      fileType = "html";
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
export function setupFileWatchers(): void {
  WATCH_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`👀 Watching directory: ${dir}`);

      try {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (filename && eventType === "change") {
            const filePath = path.join(dir, filename);

            // Only process on file changes (not deletions)
            if (fs.existsSync(filePath)) {
              console.log(`📝 File ${eventType}: ${filePath}`);
              processFile(filePath);
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
export function setupStatusReporting(): void {
  setInterval(() => {
    const status = queueManager.getStatus();
    console.log(
      `📊 Queue Status: ${status.totalQueues} total queues, ${status.processingFiles.length} processing, processing: ${status.isProcessing}`
    );
  }, 10000); // Report every 10 seconds
}
