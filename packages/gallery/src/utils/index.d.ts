/**
 * Gallery Utilities
 * Helper functions for file management, thumbnails, and media processing
 */
import type {
  FileItem,
  FolderItem,
  FileMetadata,
  ThumbnailOptions,
  SortConfiguration,
  FilterConfiguration,
  BreadcrumbItem,
} from "../types";
/**
 * File type detection utilities
 */
export declare function getFileType(
  fileName: string,
  mimeType?: string,
): FileItem["type"];
/**
 * Get file extension from filename
 */
export declare function getFileExtension(fileName: string): string;
/**
 * Format file size for display
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Format duration for video/audio files
 */
export declare function formatDuration(seconds: number): string;
/**
 * Format timestamp for display
 */
export declare function formatDate(
  timestamp: number,
  format?: "short" | "long" | "relative",
): string;
/**
 * Generate thumbnail URL with options
 */
export declare function generateThumbnailUrl(
  baseUrl: string,
  options?: Partial<ThumbnailOptions>,
): string;
/**
 * Calculate responsive grid dimensions
 */
export declare function calculateGridDimensions(
  containerWidth: number,
  itemSize: "small" | "medium" | "large" | "xl",
  itemsPerRow?: number,
): {
  itemWidth: number;
  itemHeight: number;
  columns: number;
};
/**
 * Sort items according to configuration
 */
export declare function sortItems(
  items: (FileItem | FolderItem)[],
  config: SortConfiguration,
): (FileItem | FolderItem)[];
/**
 * Filter items according to configuration
 */
export declare function filterItems(
  items: (FileItem | FolderItem)[],
  config: FilterConfiguration,
): (FileItem | FolderItem)[];
/**
 * Generate breadcrumb items from path
 */
export declare function generateBreadcrumbs(
  currentPath: string,
): BreadcrumbItem[];
/**
 * Validate file for upload
 */
export declare function validateFile(
  file: File,
  config: {
    maxFileSize: number;
    allowedTypes: string[];
  },
): {
  valid: boolean;
  error?: string;
};
/**
 * Extract metadata from file
 */
export declare function extractFileMetadata(
  file: File,
): Promise<Partial<FileMetadata>>;
/**
 * Generate unique ID for files
 */
export declare function generateFileId(
  file: File | string,
  path?: string,
): string;
/**
 * Debounce function for search and filtering
 */
export declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void;
/**
 * Throttle function for scroll events
 */
export declare function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void;
/**
 * Check if item is image
 */
export declare function isImage(item: FileItem | FolderItem): item is FileItem;
/**
 * Check if item is video
 */
export declare function isVideo(item: FileItem | FolderItem): item is FileItem;
/**
 * Check if item is audio
 */
export declare function isAudio(item: FileItem | FolderItem): item is FileItem;
/**
 * Check if item is folder
 */
export declare function isFolder(
  item: FileItem | FolderItem,
): item is FolderItem;
/**
 * Get file icon based on type
 */
export declare function getFileIcon(item: FileItem | FolderItem): string;
/**
 * Join URL paths correctly
 */
export declare function joinPaths(...paths: string[]): string;
/**
 * Get parent path
 */
export declare function getParentPath(path: string): string;
/**
 * Check if path is child of another path
 */
export declare function isChildPath(
  childPath: string,
  parentPath: string,
): boolean;
