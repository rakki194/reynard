/**
 * 🦊 Reynard Queue-Based File Watcher (TypeScript)
 *
 * This watcher uses the queue manager to ensure all file processing
 * happens in perfect sequence, eliminating race conditions.
 */

import fs from "fs";
import path from "path";
import { Processors } from "./processors.js";
import { queueManager } from "./queue-manager.js";
import type { FileProcessor, FileType, QueueStatus } from "./types.js";

interface RecentlyProcessedEntry {
  timestamp: number;
  filePath: string;
}

// Watch for changes in markdown files
const watchDirectories: string[] = ["docs", "packages", "examples", "templates", ".cursor/docs"];

// Directories and patterns to exclude from watching
const excludePatterns: RegExp[] = [
  /\/dist\//, // dist folders
  /\/node_modules\//, // node_modules
  /\/\.git\//, // .git folder
  /\/\.vscode\//, // .vscode folder
  /\/build\//, // build folders
  /\/coverage\//, // coverage folders
  /\/\.nyc_output\//, // nyc output
  /\/\.cache\//, // cache folders
  /\/tmp\//, // temporary folders
];

// Track recently processed files to avoid excessive runs
const recentlyProcessed = new Map<string, number>();
const PROCESSING_COOLDOWN = 2000; // 2 seconds

/**
 * Check if a file path should be excluded from processing
 * @param filePath - Path to the file
 * @returns True if the file should be excluded
 */
function shouldExcludeFile(filePath: string): boolean {
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
 * @param filePath - Path to the file
 * @returns True if the file was recently processed
 */
function wasRecentlyProcessed(filePath: string): boolean {
  const now = Date.now();
  const lastProcessed = recentlyProcessed.get(filePath);
  return lastProcessed !== undefined && now - lastProcessed < PROCESSING_COOLDOWN;
}

/**
 * Mark a file as recently processed
 * @param filePath - Path to the file
 */
function markAsRecentlyProcessed(filePath: string): void {
  recentlyProcessed.set(filePath, Date.now());
}

/**
 * Process a markdown file using the queue system
 * @param filePath - Path to the markdown file
 */
function processMarkdownFile(filePath: string): void {
  if (!filePath.endsWith(".md") && !filePath.endsWith(".markdown")) {
    return;
  }

  // Check if we've recently processed this file
  if (wasRecentlyProcessed(filePath)) {
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
 * @param filePath - Path to the Python file
 */
function processPythonFile(filePath: string): void {
  if (!filePath.endsWith(".py")) {
    return;
  }

  // Check if we've recently processed this file
  if (wasRecentlyProcessed(filePath)) {
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
 * @param filePath - Path to the TS/JS file
 */
function processTypeScriptFile(filePath: string): void {
  const supportedExtensions = [".ts", ".tsx", ".js", ".jsx"];
  const hasSupportedExtension = supportedExtensions.some(ext => filePath.endsWith(ext));

  if (!hasSupportedExtension) {
    return;
  }

  // Check if we've recently processed this file
  if (wasRecentlyProcessed(filePath)) {
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
 * @param filePath - Path to the file
 */
function processFile(filePath: string): void {
  // Check if file should be excluded
  if (shouldExcludeFile(filePath)) {
    console.log(`🚫 Excluding file (in excluded directory): ${filePath}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".md":
    case ".markdown":
      processMarkdownFile(filePath);
      break;
    case ".py":
      processPythonFile(filePath);
      break;
    case ".ts":
    case ".tsx":
    case ".js":
    case ".jsx":
      processTypeScriptFile(filePath);
      break;
    default:
      console.log(`⏭️  Skipping unsupported file type: ${filePath}`);
  }
}

/**
 * Set up file watchers for the specified directories
 */
function setupFileWatchers(): void {
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
function setupStatusReporting(): void {
  setInterval(() => {
    const status: QueueStatus = queueManager.getStatus();
    if (status.isProcessing || status.processingFiles.length > 0) {
      console.log(
        `📊 Queue Status: ${status.processingFiles.length} files processing, ${Object.keys(status.queueDetails).length} total queues`
      );
    }
  }, 10000);
}

/**
 * Handle graceful shutdown of the watcher
 */
function setupGracefulShutdown(): void {
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down queue watcher...");
    const status: QueueStatus = queueManager.getStatus();
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
function initializeWatcher(): void {
  console.log("🦊 Reynard Queue-Based Watcher started! Press Ctrl+C to stop.");
  console.log("📁 Watching directories:", watchDirectories.join(", "));
  console.log("🚫 Excluding patterns:", excludePatterns.map(p => p.toString()).join(", "));
  console.log("🔄 Using queue-based processing for perfect sequencing");
}

// Main execution
function main(): void {
  initializeWatcher();
  setupFileWatchers();
  setupStatusReporting();
  setupGracefulShutdown();
}

// Start the watcher
main();
