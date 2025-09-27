/**
 * ⚗️ Catalyst File Utils Index
 * Main export for file utility functionality
 */

export { FileTypeDetector } from "./FileTypeDetector.js";
export { FileExclusionManager } from "./FileExclusionManager.js";
export { FileManager } from "./FileManager.js";
export { FileDiscoveryService } from "./FileDiscoveryService.js";
export { JunkFileDetector } from "./JunkFileDetector.js";
export type {
  FileInfo,
  FileType,
  FileTypeMapping,
  ExclusionPattern,
  FileManagerOptions,
  ScanOptions,
  BackupResult,
} from "../types/FileUtils.js";
export type {
  DiscoveryOptions,
  LanguageInfo
} from "./FileDiscoveryService.js";
export type {
  JunkDetectionResult,
  JunkFileResult,
  JunkPatterns
} from "./JunkFileDetector.js";
