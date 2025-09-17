/**
 * 🦊 Reynard Queue Watcher CLI
 *
 * Command-line interface for the Reynard queue-based file watcher.
 */

import { program } from "commander";
import fs from "fs";
import path from "path";
import { Processors } from "./processors.js";
import { queueManager } from "./queue-manager.js";
import type { FileProcessor, FileType } from "./types.js";

// Default configuration
const DEFAULT_CONFIG = {
  watchDirectories: ["docs", "packages", "examples", "templates", ".cursor/docs"],
  excludePatterns: [
    /\/dist\//, // dist folders
    /\/node_modules\//, // node_modules
    /\/\.git\//, // .git folder
    /\/\.vscode\//, // .vscode folder
    /\/build\//, // build folders
    /\/coverage\//, // coverage folders
    /\/\.nyc_output\//, // nyc output
    /\/\.cache\//, // cache folders
    /\/tmp\//, // temporary folders
  ],
  processingCooldown: 2000, // 2 seconds
  statusReportInterval: 10000, // 10 seconds
};

// Track recently processed files to avoid excessive runs
const recentlyProcessed = new Map<string, number>();

/**
 * Check if a file path should be excluded from processing
 */
function shouldExcludeFile(filePath: string, excludePatterns: RegExp[]): boolean {
  const normalizedPath = path.resolve(filePath);

  // Check against exclusion patterns
  for (const pattern of excludePatterns) {
    if (pattern.test(normalizedPath)) {
      return true;
    }
  }

  // Check if file is in a dist folder (case-insensitive)
  const pathParts = normalizedPath.split(path.sep);
  for (const part of pathParts) {
    if (part.toLowerCase() === "dist") {
      return true;
    }
  }

  return false;
}

/**
 * Check if a file was recently processed to avoid excessive runs
 */
function wasRecentlyProcessed(filePath: string, cooldown: number): boolean {
  const now = Date.now();
  const lastProcessed = recentlyProcessed.get(filePath);
  return lastProcessed !== undefined && now - lastProcessed < cooldown;
}

/**
 * Mark a file as recently processed
 */
function markAsRecentlyProcessed(filePath: string): void {
  recentlyProcessed.set(filePath, Date.now());
}

/**
 * Process a markdown file using the queue system
 */
function processMarkdownFile(filePath: string, cooldown: number): void {
  if (!filePath.endsWith(".md") && !filePath.endsWith(".markdown")) {
    return;
  }

  // Check if we've recently processed this file
  if (wasRecentlyProcessed(filePath, cooldown)) {
    console.log(`⏭️  Skipping ${filePath} - recently processed`);
    return;
  }

  console.log(`🦊 Queuing markdown file: ${filePath}`);

  // Define the processing chain for markdown files
  const processors: FileProcessor[] = [
    Processors.waitForStable,
    Processors.validateSentenceLength,
    Processors.validateLinks,
  ];

  // Add to queue
  queueManager.enqueueFile(filePath, processors, {
    fileType: "markdown",
    priority: "normal",
  });

  // Mark as recently processed
  markAsRecentlyProcessed(filePath);
}

/**
 * Process a Python file using the queue system
 */
function processPythonFile(filePath: string, cooldown: number): void {
  if (!filePath.endsWith(".py")) {
    return;
  }

  // Check if we've recently processed this file
  if (wasRecentlyProcessed(filePath, cooldown)) {
    console.log(`⏭️  Skipping ${filePath} - recently processed`);
    return;
  }

  console.log(`🐍 Queuing Python file: ${filePath}`);

  // Define the processing chain for Python files
  const processors: FileProcessor[] = [Processors.waitForStable, Processors.validatePython];

  // Add to queue
  queueManager.enqueueFile(filePath, processors, {
    fileType: "python",
    priority: "normal",
  });

  // Mark as recently processed
  markAsRecentlyProcessed(filePath);
}

/**
 * Process a TypeScript/JavaScript file using the queue system
 */
function processTypeScriptFile(filePath: string, cooldown: number): void {
  const supportedExtensions = [".ts", ".tsx", ".js", ".jsx"];
  const hasSupportedExtension = supportedExtensions.some(ext => filePath.endsWith(ext));

  if (!hasSupportedExtension) {
    return;
  }

  // Check if we've recently processed this file
  if (wasRecentlyProcessed(filePath, cooldown)) {
    console.log(`⏭️  Skipping ${filePath} - recently processed`);
    return;
  }

  console.log(`📘 Queuing TypeScript file: ${filePath}`);

  // Define the processing chain for TypeScript files
  const processors: FileProcessor[] = [
    Processors.waitForStable,
    Processors.formatWithPrettier,
    Processors.fixWithESLint,
  ];

  // Determine file type based on extension
  const fileType: FileType = filePath.endsWith(".py")
    ? "python"
    : filePath.endsWith(".ts") || filePath.endsWith(".tsx")
      ? "typescript"
      : "javascript";

  // Add to queue
  queueManager.enqueueFile(filePath, processors, {
    fileType,
    priority: "normal",
  });

  // Mark as recently processed
  markAsRecentlyProcessed(filePath);
}

/**
 * Process a file based on its type
 */
function processFile(filePath: string, excludePatterns: RegExp[], cooldown: number): void {
  // Check if file should be excluded
  if (shouldExcludeFile(filePath, excludePatterns)) {
    console.log(`🚫 Excluding file (in excluded directory): ${filePath}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".md":
    case ".markdown":
      processMarkdownFile(filePath, cooldown);
      break;
    case ".py":
      processPythonFile(filePath, cooldown);
      break;
    case ".ts":
    case ".tsx":
    case ".js":
    case ".jsx":
      processTypeScriptFile(filePath, cooldown);
      break;
    default:
      console.log(`⏭️  Skipping unsupported file type: ${filePath}`);
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
    if (status.isProcessing || status.processingFiles.length > 0) {
      console.log(
        `📊 Queue Status: ${status.processingFiles.length} files processing, ${Object.keys(status.queueDetails).length} total queues`
      );
    }
  }, interval);
}

/**
 * Handle graceful shutdown of the watcher
 */
function setupGracefulShutdown(): void {
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down queue watcher...");
    const status = queueManager.getStatus();
    if (status.isProcessing || status.processingFiles.length > 0) {
      console.log("⏳ Waiting for current processing to complete...");
      // Wait a bit for processing to complete
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    } else {
      process.exit(0);
    }
  });
}

/**
 * Initialize the queue watcher
 */
function initializeWatcher(config: typeof DEFAULT_CONFIG): void {
  console.log("🦊 Reynard Queue-Based Watcher started! Press Ctrl+C to stop.");
  console.log("📁 Watching directories:", config.watchDirectories.join(", "));
  console.log("🚫 Excluding patterns:", config.excludePatterns.map(p => p.toString()).join(", "));
  console.log("🔄 Using queue-based processing for perfect sequencing");
}

// CLI Program
program
  .name("reynard-queue-watcher")
  .description("Queue-based file watcher for Reynard development workflow")
  .version("0.1.0");

// Watch command (default)
program
  .option("-d, --directories <dirs...>", "Directories to watch", DEFAULT_CONFIG.watchDirectories)
  .option("-c, --cooldown <ms>", "Processing cooldown in milliseconds", String(DEFAULT_CONFIG.processingCooldown))
  .option("-i, --interval <ms>", "Status report interval in milliseconds", String(DEFAULT_CONFIG.statusReportInterval))
  .option("--no-markdown", "Disable markdown processing")
  .option("--no-python", "Disable Python processing")
  .option("--no-typescript", "Disable TypeScript/JavaScript processing")
  .action(options => {
    const config = {
      ...DEFAULT_CONFIG,
      watchDirectories: options.directories,
      processingCooldown: parseInt(options.cooldown, 10),
      statusReportInterval: parseInt(options.interval, 10),
    };

    initializeWatcher(config);
    setupFileWatchers(config.watchDirectories, config.excludePatterns, config.processingCooldown);
    setupStatusReporting(config.statusReportInterval);
    setupGracefulShutdown();
  });

// Process command for single file processing
program
  .command("process <file>")
  .description("Process a single file")
  .option("-c, --cooldown <ms>", "Processing cooldown in milliseconds", String(DEFAULT_CONFIG.processingCooldown))
  .option("--no-markdown", "Disable markdown processing")
  .option("--no-python", "Disable Python processing")
  .option("--no-typescript", "Disable TypeScript/JavaScript processing")
  .action((file, options) => {
    console.log(`🦊 Processing single file: ${file}`);

    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      process.exit(1);
    }

    const cooldown = parseInt(options.cooldown, 10);
    processFile(file, DEFAULT_CONFIG.excludePatterns, cooldown);

    // Wait for processing to complete
    const checkProcessing = () => {
      const status = queueManager.getStatus();
      if (status.isProcessing || status.processingFiles.length > 0) {
        setTimeout(checkProcessing, 100);
      } else {
        console.log("✅ File processing completed");
        process.exit(0);
      }
    };

    setTimeout(checkProcessing, 100);
  });

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
