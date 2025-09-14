#!/usr/bin/env node

/**
 * 🦊 Reynard Queue-Based Validation Runner
 *
 * This script runs validation using the queue system for perfect sequencing.
 */

import path from "path";
import { fileURLToPath } from "url";
import { Processors, queueManager } from "./queue-manager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error("❌ No file path provided");
  process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();

console.log(`🦊 Running queue-based validation for: ${filePath}`);

// Define processors based on file type
let processors = [];

switch (ext) {
  case ".md":
  case ".markdown":
    console.log("📚 Processing as markdown file");
    processors = [Processors.waitForStable, Processors.validateSentenceLength, Processors.validateLinks];
    break;

  case ".py":
    console.log("🐍 Processing as Python file");
    processors = [Processors.waitForStable, Processors.validatePython];
    break;

  case ".ts":
  case ".tsx":
  case ".js":
  case ".jsx":
    console.log("📘 Processing as TypeScript/JavaScript file");
    processors = [Processors.waitForStable, Processors.formatWithPrettier, Processors.fixWithESLint];
    break;

  default:
    console.log(`⚠️  Unsupported file type: ${ext}`);
    process.exit(1);
}

// Add to queue and wait for completion
queueManager.enqueueFile(filePath, processors, {
  fileType: ext.substring(1),
  priority: "high",
});

// Wait for processing to complete
const checkCompletion = () => {
  const status = queueManager.getStatus();

  if (status.processingFiles.includes(path.resolve(filePath))) {
    // Still processing
    setTimeout(checkCompletion, 100);
  } else {
    // Processing complete
    console.log("✅ Queue-based validation completed!");
    process.exit(0);
  }
};

// Start checking for completion
setTimeout(checkCompletion, 100);

