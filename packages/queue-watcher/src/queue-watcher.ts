/**
 * 🦊 Reynard Queue-Based File Watcher (TypeScript)
 *
 * This watcher uses the queue manager to ensure all file processing
 * happens in perfect sequence, eliminating race conditions.
 */

import { setupFileWatchers, setupStatusReporting } from "./watcher.js";

/**
 * Main entry point for the queue watcher
 */
function main(): void {
  console.log("🦊 Starting Reynard Queue Watcher...");

  // Set up file watchers
  setupFileWatchers();

  // Set up status reporting
  setupStatusReporting();

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
}

// Start the watcher if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
