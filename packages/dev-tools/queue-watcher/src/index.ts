/**
 * 🦊 Reynard Queue Watcher Package
 *
 * This package provides a queue-based file processing system for the Reynard framework.
 * It ensures all validators and formatters run in perfect sequence for each file,
 * eliminating race conditions and ensuring consistent results.
 */

// Export main classes and functions
export { Processors } from "./processors.js";
export { FileQueueManager, createQueueManager, queueManager } from "./queue-manager.js";

// Export enhanced file utilities using catalyst
export { shouldExcludeFile, wasRecentlyProcessed, getFileType } from "./queueFileUtils.js";
// Legacy file-utils export for backward compatibility
export * from "./file-utils.js";

// Export types
export type {
  FileProcessor,
  FileType,
  FileTypeConfig,
  FileWatcherOptions,
  Priority,
  ProcessingOptions,
  ProcessingResult,
  ProcessorChain,
  ProcessorEntry,
  QueueManagerOptions,
  QueueStatus,
  WatcherConfig,
  WatcherEvent,
  WatcherStats,
} from "./types.js";

// CLI is available as a separate entry point

// Default export
export { queueManager as default } from "./queue-manager.js";
