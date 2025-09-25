/**
 * 🦊 Reynard Queue Watcher CLI
 *
 * Command-line interface for the Reynard queue-based file watcher.
 */

import { program } from "commander";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { DEFAULT_CONFIG } from "./config.js";
import { shouldExcludeFile, wasRecentlyProcessed } from "./file-utils.js";
import { Processors } from "./processors.js";
import { queueManager } from "./queue-manager.js";
import type { FileType } from "./types.js";

// Track recently processed files to avoid excessive runs
const recentlyProcessed = new Map<string, number>();

/**
 * Get file type from extension
 */
function getFileTypeFromExtension(filePath: string): FileType | null {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".md":
    case ".mdx":
      return "markdown";
    case ".ts":
    case ".tsx":
      return "typescript";
    case ".js":
    case ".jsx":
      return "javascript";
    case ".py":
      return "python";
    case ".json":
      return "json";
    case ".yaml":
    case ".yml":
      return "yaml";
    case ".css":
      return "css";
    case ".html":
    case ".htm":
      return "html";
    default:
      return null;
  }
}

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
  const fileType = getFileTypeFromExtension(filePath);

  if (!fileType) {
    console.log(`⏭️  Skipping unsupported file type: ${filePath}`);
    return;
  }

  console.log(`🔄 Processing ${fileType} file: ${filePath}`);
  // For now, just use the waitForStable processor for all file types
  queueManager.enqueueFile(filePath, [Processors.waitForStable], { fileType });
}

/**
 * Set up file watchers for the specified directories
 */
function setupFileWatchers(watchDirectories: string[], excludePatterns: RegExp[], cooldown: number): void {
  watchDirectories.forEach(dir => {
    // Convert relative paths to absolute paths
    const absoluteDir = path.resolve(dir);

    if (fs.existsSync(absoluteDir)) {
      console.log(`👀 Watching directory: ${absoluteDir}`);

      try {
        const watcher = chokidar.watch(absoluteDir, {
          ignored: /(^|[/\\])\../, // ignore dotfiles
          persistent: true,
          ignoreInitial: true,
          followSymlinks: false,
        });

        watcher
          .on("change", filePath => {
            console.log(`📝 File changed: ${filePath}`);
            processFile(filePath, excludePatterns, cooldown);
          })
          .on("add", filePath => {
            console.log(`📝 File added: ${filePath}`);
            processFile(filePath, excludePatterns, cooldown);
          })
          .on("unlink", filePath => {
            console.log(`🗑️  File removed: ${filePath}`);
            // Don't process deleted files
          })
          .on("error", error => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Watcher error for directory ${absoluteDir}:`, errorMessage);
          })
          .on("ready", () => {
            console.log(`✅ Watcher ready for directory: ${absoluteDir}`);
          });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to watch directory ${absoluteDir}:`, errorMessage);
      }
    } else {
      console.log(`⚠️  Directory not found: ${absoluteDir}`);
    }
  });
}

/**
 * Set up status reporting for the queue
 */
function setupStatusReporting(interval: number): void {
  setInterval(() => {
    const status = queueManager.getStatus();
    console.log(
      `📊 Queue Status: ${status.totalQueues} total queues, ${status.processingFiles.length} processing, processing: ${status.isProcessing}`
    );
  }, interval);
}

// CLI setup
program.name("reynard-queue-watcher").description("🦊 Reynard Queue-Based File Watcher").version("1.0.0");

program
  .option("-d, --directories <dirs...>", "Directories to watch", DEFAULT_CONFIG.watchDirectories)
  .option("-c, --cooldown <ms>", "Processing cooldown in milliseconds", DEFAULT_CONFIG.processingCooldown.toString())
  .option(
    "-i, --interval <ms>",
    "Status report interval in milliseconds",
    DEFAULT_CONFIG.statusReportInterval.toString()
  )
  .action(options => {
    const config = {
      watchDirectories: options.directories,
      excludePatterns: DEFAULT_CONFIG.excludePatterns,
      processingCooldown: parseInt(options.cooldown),
      statusReportInterval: parseInt(options.interval),
    };

    console.log("🦊 Starting Reynard Queue Watcher...");
    console.log(`📁 Watching directories: ${config.watchDirectories.join(", ")}`);
    console.log(`⏱️  Processing cooldown: ${config.processingCooldown}ms`);
    console.log(`📊 Status interval: ${config.statusReportInterval}ms`);

    // Set up file watchers
    setupFileWatchers(config.watchDirectories, config.excludePatterns, config.processingCooldown);

    // Set up status reporting
    setupStatusReporting(config.statusReportInterval);

    console.log("✅ Queue watcher is running. Press Ctrl+C to stop.");

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down queue watcher...");
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Shutting down queue watcher...");
      process.exit(0);
    });
  });

program.parse();
