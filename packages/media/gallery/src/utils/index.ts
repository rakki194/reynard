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
import { useI18n } from "reynard-i18n";

/**
 * File type detection utilities
 */
export function getFileType(fileName: string, mimeType?: string): FileItem["type"] {
  const ext = getFileExtension(fileName);

  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("text/")) return "text";
  }

  // Fallback to extension-based detection
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"];
  const audioExts = ["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma"];
  const textExts = ["txt", "md", "json", "xml", "html", "css", "js", "ts", "py"];

  if (imageExts.includes(ext)) return "image";
  if (videoExts.includes(ext)) return "video";
  if (audioExts.includes(ext)) return "audio";
  if (textExts.includes(ext)) return "text";

  return "unknown";
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : "";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Format duration for video/audio files
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format timestamp for display
 */
export function formatDate(timestamp: number, format: "short" | "long" | "relative" = "short"): string {
  const date = new Date(timestamp);
  const now = new Date();
  const { t } = useI18n();

  if (format === "relative") {
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("gallery.time.today");
    if (diffDays === 1) return t("gallery.time.yesterday");
    if (diffDays < 7) return t("gallery.time.daysAgo", { count: diffDays });
    if (diffDays < 30) return t("gallery.time.weeksAgo", { count: Math.floor(diffDays / 7) });
    if (diffDays < 365) return t("gallery.time.monthsAgo", { count: Math.floor(diffDays / 30) });
    return t("gallery.time.yearsAgo", { count: Math.floor(diffDays / 365) });
  }

  if (format === "long") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Generate thumbnail URL with options
 */
export function generateThumbnailUrl(baseUrl: string, options: Partial<ThumbnailOptions> = {}): string {
  const params = new URLSearchParams();

  if (options.width) params.set("w", options.width.toString());
  if (options.height) params.set("h", options.height.toString());
  if (options.quality) params.set("q", options.quality.toString());
  if (options.format) params.set("format", options.format);
  if (options.maintainAspectRatio === false) params.set("fit", "fill");

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Calculate responsive grid dimensions
 */
export function calculateGridDimensions(
  containerWidth: number,
  itemSize: "small" | "medium" | "large" | "xl",
  itemsPerRow?: number
): { itemWidth: number; itemHeight: number; columns: number } {
  const baseSizes = {
    small: 120,
    medium: 180,
    large: 240,
    xl: 320,
  };

  const baseSize = baseSizes[itemSize];
  const gap = 16; // CSS gap between items

  if (itemsPerRow) {
    const availableWidth = containerWidth - gap * (itemsPerRow - 1);
    const itemWidth = Math.max(availableWidth / itemsPerRow, 100);
    return {
      itemWidth,
      itemHeight: itemWidth,
      columns: itemsPerRow,
    };
  }

  // Auto-calculate columns based on container width
  const columns = Math.max(1, Math.floor((containerWidth + gap) / (baseSize + gap)));
  const availableWidth = containerWidth - gap * (columns - 1);
  const itemWidth = availableWidth / columns;

  return {
    itemWidth,
    itemHeight: itemWidth,
    columns,
  };
}

/**
 * Sort items according to configuration
 */
export function sortItems(items: (FileItem | FolderItem)[], config: SortConfiguration): (FileItem | FolderItem)[] {
  const { field, direction } = config;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    // Always put folders first
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    let comparison = 0;

    switch (field) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "size":
        comparison =
          (a.type === "folder" ? 0 : (a as FileItem).size) - (b.type === "folder" ? 0 : (b as FileItem).size);
        break;
      case "lastModified":
        comparison = a.lastModified - b.lastModified;
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "favorite":
        const aFav = a.favorited ? 1 : 0;
        const bFav = b.favorited ? 1 : 0;
        comparison = bFav - aFav; // Favorites first
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }

    return comparison * multiplier;
  });
}

/**
 * Filter items according to configuration
 */
export function filterItems(items: (FileItem | FolderItem)[], config: FilterConfiguration): (FileItem | FolderItem)[] {
  return items.filter(item => {
    // Search query filter
    if (config.searchQuery) {
      const query = config.searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    // File type filter
    if (config.fileTypes.length > 0 && item.type !== "folder") {
      const fileItem = item as FileItem;
      const matchesType = config.fileTypes.some(type => {
        if (type === "*") return true;
        if (type.endsWith("/*")) {
          const category = type.slice(0, -2);
          return fileItem.type === category;
        }
        return fileItem.mimeType?.includes(type) || fileItem.name.toLowerCase().endsWith(`.${type}`);
      });
      if (!matchesType) return false;
    }

    // Favorites filter
    if (config.favoritesOnly && !item.favorited) {
      return false;
    }

    // Date range filter
    if (config.dateRange) {
      const itemDate = new Date(item.lastModified);
      if (itemDate < config.dateRange.start || itemDate > config.dateRange.end) {
        return false;
      }
    }

    // Size range filter
    if (config.sizeRange && item.type !== "folder") {
      const fileItem = item as FileItem;
      if (fileItem.size < config.sizeRange.min || fileItem.size > config.sizeRange.max) {
        return false;
      }
    }

    // Hidden files filter
    if (!config.showHidden && item.name.startsWith(".")) {
      return false;
    }

    return true;
  });
}

/**
 * Generate breadcrumb items from path
 */
export function generateBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const parts = currentPath.split("/").filter(Boolean);
  const { t } = useI18n();
  const breadcrumbs: BreadcrumbItem[] = [
    {
      path: "",
      label: t("gallery.navigation.home"),
      clickable: true,
    },
  ];

  let accumulatedPath = "";
  for (const part of parts) {
    accumulatedPath += `/${part}`;
    breadcrumbs.push({
      path: accumulatedPath,
      label: decodeURIComponent(part),
      clickable: true,
    });
  }

  return breadcrumbs;
}

/**
 * Validate file for upload
 */
export function validateFile(
  file: File,
  config: {
    maxFileSize: number;
    allowedTypes: string[];
  }
): { valid: boolean; error?: string } {
  // Size validation
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(config.maxFileSize)})`,
    };
  }

  // Type validation
  if (config.allowedTypes.length > 0) {
    const isAllowed = config.allowedTypes.some(type => {
      if (type === "*/*") return true;
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type (${file.type}) is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Extract metadata from file
 */
export async function extractFileMetadata(file: File): Promise<Partial<FileMetadata>> {
  const metadata: Partial<FileMetadata> = {};

  if (file.type.startsWith("image/")) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        metadata.width = img.width;
        metadata.height = img.height;
        metadata.aspectRatio = img.width / img.height;
        resolve(metadata);
      };
      img.onerror = () => resolve(metadata);
      img.src = URL.createObjectURL(file);
    });
  }

  if (file.type.startsWith("video/")) {
    return new Promise(resolve => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        metadata.width = video.videoWidth;
        metadata.height = video.videoHeight;
        metadata.duration = video.duration;
        metadata.aspectRatio = video.videoWidth / video.videoHeight;
        resolve(metadata);
      };
      video.onerror = () => resolve(metadata);
      video.src = URL.createObjectURL(file);
    });
  }

  if (file.type.startsWith("audio/")) {
    return new Promise(resolve => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        metadata.duration = audio.duration;
        resolve(metadata);
      };
      audio.onerror = () => resolve(metadata);
      audio.src = URL.createObjectURL(file);
    });
  }

  return metadata;
}

/**
 * Generate unique ID for files
 */
export function generateFileId(file: File | string, path?: string): string {
  const name = typeof file === "string" ? file : file.name;
  const size = typeof file === "string" ? 0 : file.size;
  const modified = typeof file === "string" ? Date.now() : file.lastModified;

  const input = `${name}-${size}-${modified}-${path || ""}`;

  // Simple hash function for generating IDs
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Debounce function for search and filtering
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if item is image
 */
export function isImage(item: FileItem | FolderItem): item is FileItem {
  return item.type === "image";
}

/**
 * Check if item is video
 */
export function isVideo(item: FileItem | FolderItem): item is FileItem {
  return item.type === "video";
}

/**
 * Check if item is audio
 */
export function isAudio(item: FileItem | FolderItem): item is FileItem {
  return item.type === "audio";
}

/**
 * Check if item is folder
 */
export function isFolder(item: FileItem | FolderItem): item is FolderItem {
  return item.type === "folder";
}

/**
 * Get file icon based on type
 */
export function getFileIcon(item: FileItem | FolderItem): string {
  switch (item.type) {
    case "folder":
      return "folder";
    case "image":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "audio";
    case "text":
      return "document";
    default:
      return "file";
  }
}

/**
 * Join URL paths correctly
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

/**
 * Get parent path
 */
export function getParentPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return "";
  return "/" + parts.slice(0, -1).join("/");
}

/**
 * Check if path is child of another path
 */
export function isChildPath(childPath: string, parentPath: string): boolean {
  if (parentPath === "") return true; // Root is parent of all
  return childPath.startsWith(parentPath + "/");
}
