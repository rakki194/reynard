/**
 * Constants for the Reynard Unified Repository system.
 *
 * Defines supported file types, modalities, and default configurations.
 */

import type { FileType, ModalityType } from "./types";

// ============================================================================
// Supported File Types
// ============================================================================

export const SUPPORTED_FILE_TYPES: Record<ModalityType, FileType[]> = {
  data: ["parquet", "arrow", "feather", "hdf5", "csv", "tsv", "json", "jsonl"],
  image: [
    "image", // Covers all image formats: jpg, jpeg, png, gif, webp, avif, heic, heif, bmp, tiff, tif
  ],
  video: [
    "video", // Covers all video formats: mp4, avi, mov, mkv, webm, flv, wmv, mpg, mpeg
  ],
  audio: [
    "audio", // Covers all audio formats: mp3, wav, flac, aac, ogg, m4a, wma
  ],
  document: ["pdf", "html", "markdown", "docx", "epub"],
  text: [
    "text", // Covers plain text files
  ],
  code: [
    "code", // Covers all programming languages
  ],
};

// ============================================================================
// File Extension Mappings
// ============================================================================

export const FILE_EXTENSION_MAP: Record<string, FileType> = {
  // Data formats
  parquet: "parquet",
  arrow: "arrow",
  feather: "feather",
  h5: "hdf5",
  hdf5: "hdf5",
  csv: "csv",
  tsv: "tsv",
  json: "json",
  jsonl: "jsonl",

  // Image formats
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  avif: "image",
  heic: "image",
  heif: "image",
  bmp: "image",
  tiff: "image",
  tif: "image",
  jxl: "image",
  jp2: "image",
  j2k: "image",
  jpx: "image",
  jpf: "image",
  svg: "image",
  eps: "image",
  ai: "image",
  cdr: "image",
  raw: "image",
  cr2: "image",
  nef: "image",
  arw: "image",
  dng: "image",

  // Video formats
  mp4: "video",
  avi: "video",
  mov: "video",
  mkv: "video",
  webm: "video",
  flv: "video",
  wmv: "video",
  mpg: "video",
  mpeg: "video",
  mts: "video",
  m2ts: "video",
  prores: "video",
  dnxhd: "video",
  cine: "video",
  r3d: "video",
  braw: "video",

  // Audio formats
  mp3: "audio",
  wav: "audio",
  flac: "audio",
  aac: "audio",
  ogg: "audio",
  m4a: "audio",
  wma: "audio",
  opus: "audio",
  alac: "audio",
  ape: "audio",
  wv: "audio",
  dsd: "audio",
  dff: "audio",
  dsf: "audio",

  // Document formats
  pdf: "pdf",
  html: "html",
  htm: "html",
  md: "markdown",
  markdown: "markdown",
  rst: "markdown",
  tex: "markdown",
  docx: "docx",
  doc: "docx",
  pptx: "docx",
  ppt: "docx",
  xlsx: "docx",
  xls: "docx",
  odt: "docx",
  odp: "docx",
  ods: "docx",
  epub: "epub",
  mobi: "epub",
  azw3: "epub",
  kfx: "epub",
  rtf: "docx",
  pages: "docx",
  key: "docx",
  numbers: "docx",

  // Text formats
  txt: "text",
  log: "text",
  yaml: "text",
  yml: "text",
  toml: "text",
  ini: "text",
  cfg: "text",
  conf: "text",
  sql: "text",

  // Code formats
  py: "code",
  js: "code",
  ts: "code",
  tsx: "code",
  jsx: "code",
  java: "code",
  cpp: "code",
  c: "code",
  h: "code",
  hpp: "code",
  cs: "code",
  php: "code",
  rb: "code",
  go: "code",
  rs: "code",
  swift: "code",
  kt: "code",
  scala: "code",
  clj: "code",
  hs: "code",
  ml: "code",
  fs: "code",
  sh: "code",
  bash: "code",
  zsh: "code",
  fish: "code",
  ps1: "code",
  bat: "code",
  cmd: "code",

  // Archive formats
  zip: "zip",
  tar: "tar",
  gz: "gzip",
  gzip: "gzip",
  bz2: "gzip",
  xz: "gzip",
  "7z": "zip",
  rar: "zip",
};

// ============================================================================
// Modality Mappings
// ============================================================================

export const MODALITY_MAP: Record<FileType, ModalityType> = {
  // Data formats
  parquet: "data",
  arrow: "data",
  feather: "data",
  hdf5: "data",
  csv: "data",
  tsv: "data",
  json: "data",
  jsonl: "data",

  // Media formats
  image: "image",
  video: "video",
  audio: "audio",

  // Document formats
  pdf: "document",
  html: "document",
  markdown: "document",
  docx: "document",
  epub: "document",

  // Text formats
  text: "text",

  // Code formats
  code: "code",

  // Archive formats
  zip: "zip",
  tar: "tar",
  gzip: "gzip",
};

// ============================================================================
// MIME Type Mappings
// ============================================================================

export const MIME_TYPE_MAP: Record<string, string> = {
  // Data formats
  ".parquet": "application/parquet",
  ".arrow": "application/arrow",
  ".feather": "application/feather",
  ".h5": "application/hdf5",
  ".hdf5": "application/hdf5",
  ".csv": "text/csv",
  ".tsv": "text/tab-separated-values",
  ".json": "application/json",
  ".jsonl": "application/jsonl",

  // Image formats
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  ".tif": "image/tiff",
  ".jxl": "image/jxl",
  ".jp2": "image/jp2",
  ".j2k": "image/jp2",
  ".jpx": "image/jp2",
  ".jpf": "image/jp2",
  ".svg": "image/svg+xml",
  ".eps": "application/postscript",
  ".ai": "application/postscript",
  ".cdr": "application/cdr",
  ".raw": "image/x-canon-cr2",
  ".cr2": "image/x-canon-cr2",
  ".nef": "image/x-nikon-nef",
  ".arw": "image/x-sony-arw",
  ".dng": "image/x-adobe-dng",

  // Video formats
  ".mp4": "video/mp4",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".flv": "video/x-flv",
  ".wmv": "video/x-ms-wmv",
  ".mpg": "video/mpeg",
  ".mpeg": "video/mpeg",
  ".mts": "video/mp2t",
  ".m2ts": "video/mp2t",
  ".prores": "video/quicktime",
  ".dnxhd": "video/quicktime",
  ".cine": "video/quicktime",
  ".r3d": "video/quicktime",
  ".braw": "video/quicktime",

  // Audio formats
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".wma": "audio/x-ms-wma",
  ".opus": "audio/opus",
  ".alac": "audio/alac",
  ".ape": "audio/ape",
  ".wv": "audio/wavpack",
  ".dsd": "audio/dsd",
  ".dff": "audio/dff",
  ".dsf": "audio/dsf",

  // Document formats
  ".pdf": "application/pdf",
  ".html": "text/html",
  ".htm": "text/html",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".rst": "text/x-rst",
  ".tex": "application/x-tex",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".epub": "application/epub+zip",
  ".mobi": "application/x-mobipocket-ebook",
  ".azw3": "application/vnd.amazon.ebook",
  ".kfx": "application/vnd.amazon.ebook",
  ".rtf": "application/rtf",
  ".pages": "application/vnd.apple.pages",
  ".key": "application/vnd.apple.keynote",
  ".numbers": "application/vnd.apple.numbers",

  // Text formats
  ".txt": "text/plain",
  ".log": "text/plain",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".toml": "text/toml",
  ".ini": "text/plain",
  ".cfg": "text/plain",
  ".conf": "text/plain",
  ".sql": "text/sql",

  // Code formats
  ".py": "text/x-python",
  ".js": "text/javascript",
  ".ts": "text/typescript",
  ".tsx": "text/typescript",
  ".jsx": "text/javascript",
  ".java": "text/x-java",
  ".cpp": "text/x-c++",
  ".c": "text/x-c",
  ".h": "text/x-c",
  ".hpp": "text/x-c++",
  ".cs": "text/x-csharp",
  ".php": "text/x-php",
  ".rb": "text/x-ruby",
  ".go": "text/x-go",
  ".rs": "text/x-rust",
  ".swift": "text/x-swift",
  ".kt": "text/x-kotlin",
  ".scala": "text/x-scala",
  ".clj": "text/x-clojure",
  ".hs": "text/x-haskell",
  ".ml": "text/x-ocaml",
  ".fs": "text/x-fsharp",
  ".sh": "text/x-shellscript",
  ".bash": "text/x-shellscript",
  ".zsh": "text/x-shellscript",
  ".fish": "text/x-fish",
  ".ps1": "text/x-powershell",
  ".bat": "text/x-msdos-batch",
  ".cmd": "text/x-msdos-batch",

  // Archive formats
  ".zip": "application/zip",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".gzip": "application/gzip",
  ".bz2": "application/x-bzip2",
  ".xz": "application/x-xz",
  ".7z": "application/x-7z-compressed",
  ".rar": "application/x-rar-compressed",
};

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_EMBEDDING_DIMENSIONS = 1536; // OpenAI compatible
export const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
export const DEFAULT_THUMBNAIL_SIZE: [number, number] = [300, 300];
export const DEFAULT_BATCH_SIZE = 100;
export const DEFAULT_CHUNK_SIZE = 10000;
export const DEFAULT_SIMILARITY_THRESHOLD = 0.7;
export const DEFAULT_TOP_K = 20;

// ============================================================================
// Processing Options
// ============================================================================

export const DEFAULT_PROCESSING_OPTIONS = {
  generateThumbnails: true,
  extractMetadata: true,
  generateEmbeddings: true,
  validateSchema: true,
  overwrite: false,
  batchSize: DEFAULT_BATCH_SIZE,
  chunkSize: DEFAULT_CHUNK_SIZE,
};

// ============================================================================
// Search Options
// ============================================================================

export const DEFAULT_SEARCH_OPTIONS = {
  topK: DEFAULT_TOP_K,
  similarityThreshold: DEFAULT_SIMILARITY_THRESHOLD,
  hybrid: true,
  rerank: false,
  includeMetadata: true,
  includeEmbeddings: false,
};

// ============================================================================
// Database Configuration
// ============================================================================

export const DEFAULT_DATABASE_CONFIG = {
  host: "localhost",
  port: 5432,
  database: "multimodal_repo",
  poolSize: 10,
  ssl: false,
};

// ============================================================================
// Storage Configuration
// ============================================================================

export const DEFAULT_STORAGE_CONFIG = {
  type: "local" as const,
  path: "./data",
};

// ============================================================================
// Embedding Configuration
// ============================================================================

export const DEFAULT_EMBEDDING_CONFIG = {
  textModel: "text-embedding-3-large",
  imageModel: "clip-vit-base-patch32",
  audioModel: "whisper-base",
  dataModel: "text-embedding-3-large",
  dimensions: DEFAULT_EMBEDDING_DIMENSIONS,
  batchSize: DEFAULT_BATCH_SIZE,
};

// ============================================================================
// Error Codes
// ============================================================================

export const ERROR_CODES = {
  // General errors
  NOT_INITIALIZED: "NOT_INITIALIZED",
  INITIALIZATION_ERROR: "INITIALIZATION_ERROR",
  SHUTDOWN_ERROR: "SHUTDOWN_ERROR",

  // File errors
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_PROCESSING_ERROR: "FILE_PROCESSING_ERROR",
  FILE_SERVICE_NOT_INITIALIZED: "FILE_SERVICE_NOT_INITIALIZED",

  // Dataset errors
  DATASET_NOT_FOUND: "DATASET_NOT_FOUND",
  DATASET_CREATION_ERROR: "DATASET_CREATION_ERROR",

  // Parquet errors
  PARQUET_NOT_INITIALIZED: "PARQUET_NOT_INITIALIZED",
  PARQUET_INIT_ERROR: "PARQUET_INIT_ERROR",
  PARQUET_PROCESSING_ERROR: "PARQUET_PROCESSING_ERROR",
  PARQUET_QUERY_ERROR: "PARQUET_QUERY_ERROR",

  // Search errors
  SEARCH_ERROR: "SEARCH_ERROR",
  EMBEDDING_ERROR: "EMBEDDING_ERROR",

  // Ingestion errors
  INGESTION_ERROR: "INGESTION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

// ============================================================================
// Status Values
// ============================================================================

export const DATASET_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  PROCESSING: "processing",
  ERROR: "error",
} as const;

export const FILE_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get file type from extension
 */
export function getFileTypeFromExtension(extension: string): FileType {
  const cleanExt = extension.toLowerCase().replace(/^\./, "");
  return FILE_EXTENSION_MAP[cleanExt] || "text";
}

/**
 * Get modality from file type
 */
export function getModalityFromFileType(fileType: FileType): ModalityType {
  return MODALITY_MAP[fileType] || "text";
}

/**
 * Get MIME type from extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const cleanExt = extension.toLowerCase();
  return MIME_TYPE_MAP[cleanExt] || "application/octet-stream";
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(extension: string): boolean {
  const fileType = getFileTypeFromExtension(extension);
  return Object.values(SUPPORTED_FILE_TYPES).flat().includes(fileType);
}

/**
 * Get all supported extensions
 */
export function getAllSupportedExtensions(): string[] {
  return Object.keys(FILE_EXTENSION_MAP);
}

/**
 * Get extensions for modality
 */
export function getExtensionsForModality(modality: ModalityType): string[] {
  const fileTypes = SUPPORTED_FILE_TYPES[modality];
  return Object.entries(FILE_EXTENSION_MAP)
    .filter(([_, fileType]) => fileTypes.includes(fileType))
    .map(([ext, _]) => ext);
}
