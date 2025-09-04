/**
 * File type configuration for the Reynard File Processing system.
 *
 * This module defines supported file extensions, MIME types, and processing
 * capabilities for different file categories.
 */

import { FileTypeInfo } from "../types";

/**
 * Supported image file extensions
 */
export const IMAGE_EXTENSIONS = new Set([
  // Raster formats
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".tiff",
  ".tif",
  // Modern formats
  ".jxl",
  ".avif",
  ".heic",
  ".heif",
  ".jp2",
  ".j2k",
  ".jpx",
  ".jpf",
  // Vector formats
  ".svg",
  ".eps",
  ".ai",
  ".cdr",
  ".wmf",
  ".emf",
  // Raw formats
  ".raw",
  ".cr2",
  ".nef",
  ".arw",
  ".dng",
  ".orf",
  ".rw2",
  ".pef",
  ".srw",
]);

/**
 * Supported video file extensions
 */
export const VIDEO_EXTENSIONS = new Set([
  // Common formats
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".webm",
  ".flv",
  ".wmv",
  ".m4v",
  // High quality formats
  ".mpg",
  ".mpeg",
  ".ts",
  ".mts",
  ".m2ts",
  ".vob",
  ".ogv",
  ".3gp",
  // Professional formats
  ".prores",
  ".dnxhd",
  ".cine",
  ".r3d",
  ".braw",
  ".arw",
]);

/**
 * Supported audio file extensions
 */
export const AUDIO_EXTENSIONS = new Set([
  // Lossy formats
  ".mp3",
  ".aac",
  ".ogg",
  ".wma",
  ".opus",
  // Lossless formats
  ".wav",
  ".flac",
  ".alac",
  ".ape",
  ".wv",
  ".tta",
  // High resolution formats
  ".dsd",
  ".dff",
  ".dsf",
  ".m4a",
  ".aiff",
  ".aif",
]);

/**
 * Supported text file extensions
 */
export const TEXT_EXTENSIONS = new Set([
  // Plain text
  ".txt",
  ".md",
  ".rst",
  ".tex",
  ".log",
  ".csv",
  ".tsv",
  // Data formats
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".conf",
  // Structured data
  ".parquet",
  ".arrow",
  ".feather",
  ".h5",
  ".hdf5",
  ".pkl",
  ".pickle",
  // Scientific data
  ".npy",
  ".npz",
  ".mat",
  ".sav",
  ".rdata",
  ".joblib",
]);

/**
 * Supported code file extensions
 */
export const CODE_EXTENSIONS = new Set([
  // Web technologies
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  // Programming languages
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".cs",
  ".php",
  ".rb",
  ".go",
  ".rs",
  ".swift",
  ".kt",
  ".scala",
  ".clj",
  ".hs",
  ".ml",
  ".fs",
  ".v",
  ".zig",
  ".nim",
  // Scripts and configs
  ".sh",
  ".bash",
  ".zsh",
  ".fish",
  ".ps1",
  ".bat",
  ".cmd",
  ".vbs",
  // Build and package files
  ".dockerfile",
  ".dockerignore",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  ".eslintrc",
  ".prettierrc",
  ".babelrc",
  ".webpack.config.js",
  ".rollup.config.js",
  ".vite.config.js",
  ".package.json",
  ".requirements.txt",
  ".setup.py",
  ".pyproject.toml",
  ".cargo.toml",
  ".go.mod",
  ".composer.json",
  ".gemfile",
  ".rakefile",
  ".makefile",
  ".cmake",
  ".scons",
  ".bazel",
  ".buck",
  ".gradle",
  ".maven",
  ".pom.xml",
  ".build.xml",
  ".ant",
  ".ivy",
  ".sbt",
  ".build.sbt",
  ".project",
  ".classpath",
  ".settings",
]);

/**
 * Supported document file extensions
 */
export const DOCUMENT_EXTENSIONS = new Set([
  // Office documents
  ".pdf",
  ".docx",
  ".doc",
  ".pptx",
  ".ppt",
  ".xlsx",
  ".xls",
  ".odt",
  ".odp",
  ".ods",
  // E-books
  ".epub",
  ".mobi",
  ".azw3",
  ".kfx",
  ".lit",
  ".prc",
  // Rich text
  ".rtf",
  ".pages",
  ".key",
  ".numbers",
  ".abw",
  ".kwd",
  ".odm",
  // Markup
  ".html",
  ".htm",
  ".xml",
  ".sgml",
  ".tex",
  ".ltx",
  ".sty",
  ".cls",
]);

/**
 * Supported archive file extensions
 */
export const ARCHIVE_EXTENSIONS = new Set([
  // Common archives
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".bz2",
  ".xz",
  ".lzma",
  // Disk images
  ".iso",
  ".dmg",
  ".img",
  ".vhd",
  ".vmdk",
  ".vdi",
  ".hdd",
  // Package formats
  ".deb",
  ".rpm",
  ".pkg",
  ".msi",
  ".exe",
  ".app",
  ".apk",
]);

/**
 * Supported LoRA model file extensions
 */
export const LORA_EXTENSIONS = new Set([
  ".safetensors",
  ".ckpt",
  ".pt",
  ".pth",
  ".bin",
  ".model",
  ".lora",
  ".lycoris",
]);

/**
 * Supported OCR file extensions (images that may contain text)
 */
export const OCR_EXTENSIONS = new Set([
  // Images that commonly contain text
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".jxl",
  ".avif",
  ".bmp",
  ".tiff",
  ".tif",
  // Scanned document formats
  ".pdf",
  // Additional image formats used for documents
  ".heic",
  ".heif",
  ".jp2",
  ".j2k",
  ".jpx",
  ".jpf",
]);

/**
 * Caption and metadata file extensions
 */
export const CAPTION_EXTENSIONS = new Set([
  ".caption",
  ".txt",
  ".tags",
  ".florence",
  ".wd",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
]);

/**
 * Metadata file extensions
 */
export const METADATA_EXTENSIONS = new Set([
  ".bboxes.json",
  ".metadata.json",
  ".info.json",
  ".exif",
  ".xmp",
  ".iptc",
]);

/**
 * Get file type information for a given extension
 */
export function getFileTypeInfo(extension: string): FileTypeInfo {
  const ext = extension.toLowerCase();

  if (IMAGE_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "image",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: true,
        ocr: OCR_EXTENSIONS.has(ext),
      },
    };
  }

  if (VIDEO_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "video",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  if (AUDIO_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "audio",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "text",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: true,
        ocr: false,
      },
    };
  }

  if (CODE_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "code",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: true,
        ocr: false,
      },
    };
  }

  if (DOCUMENT_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "document",
      isSupported: true,
      capabilities: {
        thumbnail: true,
        metadata: true,
        content: ext === ".pdf" || ext === ".txt",
        ocr: true,
      },
    };
  }

  if (LORA_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "other",
      isSupported: true,
      capabilities: {
        thumbnail: false,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  if (ARCHIVE_EXTENSIONS.has(ext)) {
    return {
      extension: ext,
      mimeType: getMimeType(ext),
      category: "archive",
      isSupported: false, // Archives not currently supported for processing
      capabilities: {
        thumbnail: false,
        metadata: true,
        content: false,
        ocr: false,
      },
    };
  }

  // Unknown file type
  return {
    extension: ext,
    mimeType: getMimeType(ext),
    category: "other",
    isSupported: false,
    capabilities: {
      thumbnail: false,
      metadata: false,
      content: false,
      ocr: false,
    },
  };
}

/**
 * Get MIME type for a file extension
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // Images
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".jxl": "image/jxl",
    ".avif": "image/avif",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".svg": "image/svg+xml",

    // Videos
    ".mp4": "video/mp4",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
    ".flv": "video/x-flv",
    ".wmv": "video/x-ms-wmv",
    ".m4v": "video/x-m4v",
    ".mpg": "video/mpeg",
    ".mpeg": "video/mpeg",

    // Audio
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".aiff": "audio/aiff",
    ".aif": "audio/aiff",

    // Text
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".json": "application/json",
    ".xml": "application/xml",
    ".csv": "text/csv",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".toml": "application/toml",

    // Code
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".ts": "application/typescript",
    ".jsx": "text/jsx",
    ".tsx": "text/tsx",
    ".py": "text/x-python",
    ".java": "text/x-java-source",
    ".cpp": "text/x-c++src",
    ".c": "text/x-csrc",
    ".php": "application/x-httpd-php",
    ".rb": "text/x-ruby",
    ".go": "text/x-go",
    ".rs": "text/x-rust",

    // Documents
    ".pdf": "application/pdf",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".rtf": "application/rtf",

    // Archives
    ".zip": "application/zip",
    ".rar": "application/vnd.rar",
    ".7z": "application/x-7z-compressed",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
    ".bz2": "application/x-bzip2",

    // LoRA models
    ".safetensors": "application/octet-stream",
    ".ckpt": "application/octet-stream",
    ".pt": "application/octet-stream",
    ".pth": "application/octet-stream",
    ".bin": "application/octet-stream",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Check if a file extension is supported for processing
 */
export function isSupportedExtension(extension: string): boolean {
  const ext = extension.toLowerCase();
  return (
    IMAGE_EXTENSIONS.has(ext) ||
    VIDEO_EXTENSIONS.has(ext) ||
    AUDIO_EXTENSIONS.has(ext) ||
    TEXT_EXTENSIONS.has(ext) ||
    CODE_EXTENSIONS.has(ext) ||
    DOCUMENT_EXTENSIONS.has(ext) ||
    LORA_EXTENSIONS.has(ext)
  );
}

/**
 * Get all supported file extensions
 */
export function getAllSupportedExtensions(): Set<string> {
  return new Set([
    ...IMAGE_EXTENSIONS,
    ...VIDEO_EXTENSIONS,
    ...AUDIO_EXTENSIONS,
    ...TEXT_EXTENSIONS,
    ...CODE_EXTENSIONS,
    ...DOCUMENT_EXTENSIONS,
    ...LORA_EXTENSIONS,
  ]);
}

/**
 * Get file category from extension
 */
export function getFileCategory(extension: string): string {
  const ext = extension.toLowerCase();

  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  if (CODE_EXTENSIONS.has(ext)) return "code";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "document";
  if (LORA_EXTENSIONS.has(ext)) return "lora";
  if (ARCHIVE_EXTENSIONS.has(ext)) return "archive";

  return "other";
}

/**
 * Default configuration for file processing
 */
export const DEFAULT_PROCESSING_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  timeout: 30000, // 30 seconds
  thumbnailSize: [200, 200] as [number, number],
  previewSize: [800, 800] as [number, number],
  quality: 85,
  format: "webp" as const,
};
