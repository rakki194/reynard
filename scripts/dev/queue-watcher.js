#!/usr/bin/env node

/**
 * 🦊 Reynard Queue-Based File Watcher
 *
 * This watcher uses the queue manager to ensure all file processing
 * happens in perfect sequence, eliminating race conditions.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Processors, queueManager } from "./queue-manager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Watch for changes in markdown files
const watchDirectories = ["docs", "packages", "examples", "templates", ".cursor/docs"];

// Track recently processed files to avoid excessive runs
const recentlyProcessed = new Map();
const PROCESSING_COOLDOWN = 2000; // 2 seconds

/**
 * Process a markdown file using the queue system
 * @param {string} filePath - Path to the markdown file
 */
function processMarkdownFile(filePath) {
  if (!filePath.endsWith(".md") && !filePath.endsWith(".markdown")) {
    return;
  }

  // Check if we've recently processed this file
  const now = Date.now();
  const lastProcessed = recentlyProcessed.get(filePath);
  if (lastProcessed && now - lastProcessed < PROCESSING_COOLDOWN) {
    console.log(`⏭️  Skipping ${filePath} - recently processed`);
    return;
  }

  console.log(`🦊 Queuing markdown file: ${filePath}`);

  // Define the processing chain for markdown files
  const processors = [Processors.waitForStable, Processors.validateSentenceLength, Processors.validateLinks];

  // Add to queue
  queueManager.enqueueFile(filePath, processors, {
    fileType: "markdown",
    priority: "normal",
  });

  // Mark as recently processed
  recentlyProcessed.set(filePath, now);
}

/**
 * Process a Python file using the queue system
 * @param {string} filePath - Path to the Python file
 */
function processPythonFile(filePath) {
  if (!filePath.endsWith(".py")) {
    return;
  }

  // Check if we've recently processed this file
  const now = Date.now();
  const lastProcessed = recentlyProcessed.get(filePath);
  if (lastProcessed && now - lastProcessed < PROCESSING_COOLDOWN) {
    console.log(`⏭️  Skipping ${filePath} - recently processed`);
    return;
  }

  console.log(`🐍 Queuing Python file: ${filePath}`);

  // Define the processing chain for Python files
  const processors = [Processors.waitForStable, Processors.validatePython];

  // Add to queue
  queueManager.enqueueFile(filePath, processors, {
    fileType: "python",
    priority: "normal",
  });

  // Mark as recently processed
  recentlyProcessed.set(filePath, now);
}

/**
 * Process a TypeScript/JavaScript file using the queue system
 * @param {string} filePath - Path to the TS/JS file
 */
function processTypeScriptFile(filePath) {
  if (
    !filePath.endsWith(".ts") &&
    !filePath.endsWith(".tsx") &&
    !filePath.endsWith(".js") &&
    !filePath.endsWith(".jsx")
  ) {
    return;
  }

  // Check if we've recently processed this file
  const now = Date.now();
  const lastProcessed = recentlyProcessed.get(filePath);
  if (lastProcessed && now - lastProcessed < PROCESSING_COOLDOWN) {
    console.log(`⏭️  Skipping ${filePath} - recently processed`);
    return;
  }

  console.log(`📘 Queuing TypeScript file: ${filePath}`);

  // Define the processing chain for TypeScript files
  const processors = [Processors.waitForStable, Processors.formatWithPrettier, Processors.fixWithESLint];

  // Add to queue
  queueManager.enqueueFile(filePath, processors, {
    fileType: "typescript",
    priority: "normal",
  });

  // Mark as recently processed
  recentlyProcessed.set(filePath, now);
}

/**
 * Process a file based on its type
 * @param {string} filePath - Path to the file
 */
function processFile(filePath) {
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

// Set up file watchers
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
      console.error(`❌ Failed to watch directory ${dir}:`, error.message);
    }
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
});

// Set up status reporting
setInterval(() => {
  const status = queueManager.getStatus();
  if (status.isProcessing || status.processingFiles.length > 0) {
    console.log(
      `📊 Queue Status: ${status.processingFiles.length} files processing, ${Object.keys(status.queueDetails).length} total queues`
    );
  }
}, 10000);

console.log("🦊 Reynard Queue-Based Watcher started! Press Ctrl+C to stop.");
console.log("📁 Watching directories:", watchDirectories.join(", "));
console.log("🔄 Using queue-based processing for perfect sequencing");

// Handle graceful shutdown
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

