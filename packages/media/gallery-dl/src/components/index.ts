/**
 * Gallery-dl Components Export
 *
 * Central export point for all gallery-dl SolidJS components.
 */

// Main Components
export { DownloadManager } from "./DownloadManager";
export type { DownloadManagerProps, Download, DownloadQueue } from "./DownloadManager";

export { ProgressTracker } from "./ProgressTracker";
export type { ProgressTrackerProps } from "./ProgressTracker";

export { UrlValidator } from "./UrlValidator";
export type { UrlValidatorProps, ValidationResult } from "./UrlValidator";

export { FileList } from "./FileList";
export type { FileListProps, FileItem } from "./FileList";

export { ConfigurationPanel } from "./ConfigurationPanel";
export type { ConfigurationPanelProps, GalleryConfig } from "./ConfigurationPanel";

export { AIMetadataExtractor } from "./AIMetadataExtractor";
export type { AIMetadataExtractorProps, MetadataJob, MetadataResult } from "./AIMetadataExtractor";

export { BatchDownloadManager } from "./BatchDownloadManager";
export type { BatchDownloadManagerProps, BatchItem, BatchDownload, BatchResult } from "./BatchDownloadManager";

export { ResultsDisplay } from "./ResultsDisplay";
export type { ResultsDisplayProps, DownloadResult, DownloadedFile } from "./ResultsDisplay";

// Composables
export { useGalleryWebSocket } from "../composables/useGalleryWebSocket";
export type { UseGalleryWebSocketReturn, DownloadEvent, WebSocketConfig } from "../composables/useGalleryWebSocket";

// Services
export { GalleryService } from "../services/GalleryService";
export type {
  GalleryServiceConfig,
  DownloadRequest,
  DownloadResponse,
  ExtractorInfo,
  ValidationResponse,
  BatchDownloadRequest,
  BatchDownloadResponse,
} from "../services/GalleryService";

// Types
export type { DownloadStatus, ExtractorCategory, PostProcessorType, FileType, DownloadOptions } from "../types";
