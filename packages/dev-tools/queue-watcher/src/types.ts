/**
 * 🦊 Reynard Queue Watcher Type Definitions
 *
 * This module provides comprehensive type definitions for the queue watcher system.
 */

// Type definitions for better type safety
export interface FileProcessor {
  (filePath: string, options?: ProcessingOptions): Promise<void>;
}

export interface ProcessingOptions {
  fileType?: FileType;
  priority?: Priority;
  delay?: number;
  [key: string]: unknown;
}

export type FileType = "markdown" | "python" | "typescript" | "javascript" | "json" | "yaml" | "css" | "html";
export type Priority = "low" | "normal" | "high";

export interface QueueStatus {
  totalQueues: number;
  processingFiles: string[];
  isProcessing: boolean;
  queueDetails: Record<
    string,
    {
      pendingProcessors: number;
      isProcessing: boolean;
    }
  >;
}

export interface ProcessorEntry {
  processor: FileProcessor;
  options: ProcessingOptions;
  addedAt: number;
}

export interface WatcherConfig {
  watchDirectories: string[];
  excludePatterns: RegExp[];
  processingCooldown: number;
  statusReportInterval: number;
}

export interface FileWatcherOptions {
  recursive?: boolean;
  ignoreInitial?: boolean;
  followSymlinks?: boolean;
  depth?: number;
  awaitWriteFinish?: {
    stabilityThreshold?: number;
    pollInterval?: number;
  };
}

export interface QueueManagerOptions {
  maxConcurrentFiles?: number;
  cleanupInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ProcessingResult {
  success: boolean;
  filePath: string;
  processors: string[];
  duration: number;
  errors?: string[];
}

export interface WatcherEvent {
  type: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  path: string;
  stats?: {
    size: number;
    mtime: Date;
    isFile: boolean;
    isDirectory: boolean;
  };
}

export interface ProcessorChain {
  name: string;
  processors: FileProcessor[];
  options: ProcessingOptions;
}

export interface FileTypeConfig {
  extensions: string[];
  processors: FileProcessor[];
  options: ProcessingOptions;
}

export interface WatcherStats {
  filesProcessed: number;
  filesSkipped: number;
  errors: number;
  startTime: Date;
  lastActivity: Date;
  averageProcessingTime: number;
}
