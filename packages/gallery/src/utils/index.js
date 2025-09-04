/**
 * Gallery Utilities
 * Helper functions for file management, thumbnails, and media processing
 */
/**
 * File type detection utilities
 */
export function getFileType(fileName, mimeType) {
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
  const textExts = [
    "txt",
    "md",
    "json",
    "xml",
    "html",
    "css",
    "js",
    "ts",
    "py",
  ];
  if (imageExts.includes(ext)) return "image";
  if (videoExts.includes(ext)) return "video";
  if (audioExts.includes(ext)) return "audio";
  if (textExts.includes(ext)) return "text";
  return "unknown";
}
/**
 * Get file extension from filename
 */
export function getFileExtension(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : "";
}
/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}
/**
 * Format duration for video/audio files
 */
export function formatDuration(seconds) {
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
export function formatDate(timestamp, format = "short") {
  const date = new Date(timestamp);
  const now = new Date();
  if (format === "relative") {
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
export function generateThumbnailUrl(baseUrl, options = {}) {
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
export function calculateGridDimensions(containerWidth, itemSize, itemsPerRow) {
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
  const columns = Math.max(
    1,
    Math.floor((containerWidth + gap) / (baseSize + gap)),
  );
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
export function sortItems(items, config) {
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
          (a.type === "folder" ? 0 : a.size) -
          (b.type === "folder" ? 0 : b.size);
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
export function filterItems(items, config) {
  return items.filter((item) => {
    // Search query filter
    if (config.searchQuery) {
      const query = config.searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    // File type filter
    if (config.fileTypes.length > 0 && item.type !== "folder") {
      const fileItem = item;
      const matchesType = config.fileTypes.some((type) => {
        if (type === "*") return true;
        if (type.endsWith("/*")) {
          const category = type.slice(0, -2);
          return fileItem.type === category;
        }
        return (
          fileItem.mimeType?.includes(type) ||
          fileItem.name.toLowerCase().endsWith(`.${type}`)
        );
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
      if (
        itemDate < config.dateRange.start ||
        itemDate > config.dateRange.end
      ) {
        return false;
      }
    }
    // Size range filter
    if (config.sizeRange && item.type !== "folder") {
      const fileItem = item;
      if (
        fileItem.size < config.sizeRange.min ||
        fileItem.size > config.sizeRange.max
      ) {
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
export function generateBreadcrumbs(currentPath) {
  const parts = currentPath.split("/").filter(Boolean);
  const breadcrumbs = [
    {
      path: "",
      label: "Home",
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
export function validateFile(file, config) {
  // Size validation
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(config.maxFileSize)})`,
    };
  }
  // Type validation
  if (config.allowedTypes.length > 0) {
    const isAllowed = config.allowedTypes.some((type) => {
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
export async function extractFileMetadata(file) {
  const metadata = {};
  if (file.type.startsWith("image/")) {
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
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
export function generateFileId(file, path) {
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
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
/**
 * Throttle function for scroll events
 */
export function throttle(func, limit) {
  let inThrottle;
  return (...args) => {
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
export function isImage(item) {
  return item.type === "image";
}
/**
 * Check if item is video
 */
export function isVideo(item) {
  return item.type === "video";
}
/**
 * Check if item is audio
 */
export function isAudio(item) {
  return item.type === "audio";
}
/**
 * Check if item is folder
 */
export function isFolder(item) {
  return item.type === "folder";
}
/**
 * Get file icon based on type
 */
export function getFileIcon(item) {
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
export function joinPaths(...paths) {
  return paths
    .map((path) => path.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}
/**
 * Get parent path
 */
export function getParentPath(path) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return "";
  return "/" + parts.slice(0, -1).join("/");
}
/**
 * Check if path is child of another path
 */
export function isChildPath(childPath, parentPath) {
  if (parentPath === "") return true; // Root is parent of all
  return childPath.startsWith(parentPath + "/");
}
