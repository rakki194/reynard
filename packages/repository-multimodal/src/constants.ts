/**
 * Constants for the Reynard Unified Repository system.
 *
 * Defines supported file types, modalities, and default configurations.
 */

import { FileType, ModalityType } from "./types";

// ============================================================================
// Supported File Types
// ============================================================================

export const SUPPORTED_FILE_TYPES: Record<ModalityType, FileType[]> = {
  [ModalityType.DATA]: [FileType.PARQUET, FileType.ARROW, FileType.FEATHER, FileType.HDF5, FileType.CSV, FileType.TSV, FileType.JSON, FileType.JSONL],
  [ModalityType.IMAGE]: [
    FileType.IMAGE, // Covers all image formats: jpg, jpeg, png, gif, webp, avif, heic, heif, bmp, tiff, tif
  ],
  [ModalityType.VIDEO]: [
    FileType.VIDEO, // Covers all video formats: mp4, avi, mov, mkv, webm, flv, wmv, mpg, mpeg
  ],
  [ModalityType.AUDIO]: [
    FileType.AUDIO, // Covers all audio formats: mp3, wav, flac, aac, ogg, m4a, wma
  ],
  [ModalityType.DOCUMENT]: [FileType.PDF, FileType.HTML, FileType.MARKDOWN, FileType.DOCX, FileType.EPUB],
  [ModalityType.TEXT]: [
    FileType.TEXT, // Covers plain text files
  ],
  [ModalityType.CODE]: [
    FileType.CODE, // Covers all programming languages
  ],
};

// ============================================================================
// File Extension Mappings
// ============================================================================

export const FILE_EXTENSION_MAP: Record<string, FileType> = {
  // Data formats
  parquet: FileType.PARQUET,
  arrow: FileType.ARROW,
  feather: FileType.FEATHER,
  h5: FileType.HDF5,
  hdf5: FileType.HDF5,
  csv: FileType.CSV,
  tsv: FileType.TSV,
  json: FileType.JSON,
  jsonl: FileType.JSONL,

  // Image formats
  jpg: FileType.IMAGE,
  jpeg: FileType.IMAGE,
  png: FileType.IMAGE,
  gif: FileType.IMAGE,
  webp: FileType.IMAGE,
  avif: FileType.IMAGE,
  heic: FileType.IMAGE,
  heif: FileType.IMAGE,
  bmp: FileType.IMAGE,
  tiff: FileType.IMAGE,
  tif: FileType.IMAGE,
  jxl: FileType.IMAGE,
  jp2: FileType.IMAGE,
  j2k: FileType.IMAGE,
  jpx: FileType.IMAGE,
  jpf: FileType.IMAGE,
  svg: FileType.IMAGE,
  eps: FileType.IMAGE,
  ai: FileType.IMAGE,
  cdr: FileType.IMAGE,
  raw: FileType.IMAGE,
  cr2: FileType.IMAGE,
  nef: FileType.IMAGE,
  arw: FileType.IMAGE,
  dng: FileType.IMAGE,

  // Video formats
  mp4: FileType.VIDEO,
  avi: FileType.VIDEO,
  mov: FileType.VIDEO,
  mkv: FileType.VIDEO,
  webm: FileType.VIDEO,
  flv: FileType.VIDEO,
  wmv: FileType.VIDEO,
  mpg: FileType.VIDEO,
  mpeg: FileType.VIDEO,
  mts: FileType.VIDEO,
  m2ts: FileType.VIDEO,
  prores: FileType.VIDEO,
  dnxhd: FileType.VIDEO,
  cine: FileType.VIDEO,
  r3d: FileType.VIDEO,
  braw: FileType.VIDEO,

  // Audio formats
  mp3: FileType.AUDIO,
  wav: FileType.AUDIO,
  flac: FileType.AUDIO,
  aac: FileType.AUDIO,
  ogg: FileType.AUDIO,
  m4a: FileType.AUDIO,
  wma: FileType.AUDIO,
  opus: FileType.AUDIO,
  alac: FileType.AUDIO,
  ape: FileType.AUDIO,
  wv: FileType.AUDIO,
  dsd: FileType.AUDIO,
  dff: FileType.AUDIO,
  dsf: FileType.AUDIO,

  // Document formats
  pdf: FileType.PDF,
  html: FileType.HTML,
  htm: FileType.HTML,
  md: FileType.MARKDOWN,
  markdown: FileType.MARKDOWN,
  rst: FileType.MARKDOWN,
  tex: FileType.MARKDOWN,
  docx: FileType.DOCX,
  doc: FileType.DOCX,
  pptx: FileType.DOCX,
  ppt: FileType.DOCX,
  xlsx: FileType.DOCX,
  xls: FileType.DOCX,
  odt: FileType.DOCX,
  odp: FileType.DOCX,
  ods: FileType.DOCX,
  epub: FileType.EPUB,
  mobi: FileType.EPUB,
  azw3: FileType.EPUB,
  kfx: FileType.EPUB,
  rtf: FileType.DOCX,
  pages: FileType.DOCX,
  key: FileType.DOCX,
  numbers: FileType.DOCX,

  // Text formats
  txt: FileType.TEXT,
  log: FileType.TEXT,
  yaml: FileType.TEXT,
  yml: FileType.TEXT,
  toml: FileType.TEXT,
  ini: FileType.TEXT,
  cfg: FileType.TEXT,
  conf: FileType.TEXT,
  sql: FileType.TEXT,

  // Code formats
  py: FileType.CODE,
  js: FileType.CODE,
  ts: FileType.CODE,
  tsx: FileType.CODE,
  jsx: FileType.CODE,
  java: FileType.CODE,
  cpp: FileType.CODE,
  c: FileType.CODE,
  h: FileType.CODE,
  hpp: FileType.CODE,
  cs: FileType.CODE,
  php: FileType.CODE,
  rb: FileType.CODE,
  go: FileType.CODE,
  rs: FileType.CODE,
  swift: FileType.CODE,
  kt: FileType.CODE,
  scala: FileType.CODE,
  clj: FileType.CODE,
  hs: FileType.CODE,
  ml: FileType.CODE,
  fs: FileType.CODE,
  sh: FileType.CODE,
  bash: FileType.CODE,
  zsh: FileType.CODE,
  fish: FileType.CODE,
  ps1: FileType.CODE,
  bat: FileType.CODE,
  cmd: FileType.CODE,

  // Archive formats
  zip: FileType.ZIP,
  tar: FileType.TAR,
  gz: FileType.GZIP,
  gzip: FileType.GZIP,
  bz2: FileType.GZIP,
  xz: FileType.GZIP,
  "7z": FileType.ZIP,
  rar: FileType.ZIP,
};

// ============================================================================
// Modality Mappings
// ============================================================================

export const MODALITY_MAP: Record<FileType, ModalityType> = {
  // Data formats
  [FileType.PARQUET]: ModalityType.DATA,
  [FileType.ARROW]: ModalityType.DATA,
  [FileType.FEATHER]: ModalityType.DATA,
  [FileType.HDF5]: ModalityType.DATA,
  [FileType.CSV]: ModalityType.DATA,
  [FileType.TSV]: ModalityType.DATA,
  [FileType.JSON]: ModalityType.DATA,
  [FileType.JSONL]: ModalityType.DATA,

  // Media formats
  [FileType.IMAGE]: ModalityType.IMAGE,
  [FileType.VIDEO]: ModalityType.VIDEO,
  [FileType.AUDIO]: ModalityType.AUDIO,

  // Document formats
  [FileType.PDF]: ModalityType.DOCUMENT,
  [FileType.HTML]: ModalityType.DOCUMENT,
  [FileType.MARKDOWN]: ModalityType.DOCUMENT,
  [FileType.DOCX]: ModalityType.DOCUMENT,
  [FileType.EPUB]: ModalityType.DOCUMENT,

  // Text formats
  [FileType.TEXT]: ModalityType.TEXT,

  // Code formats
  [FileType.CODE]: ModalityType.CODE,

  // Archive formats
  [FileType.ZIP]: ModalityType.DATA,
  [FileType.TAR]: ModalityType.DATA,
  [FileType.GZIP]: ModalityType.DATA,
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
  return FILE_EXTENSION_MAP[cleanExt] || FileType.TEXT;
}

/**
 * Get modality from file type
 */
export function getModalityFromFileType(fileType: FileType): ModalityType {
  return MODALITY_MAP[fileType] || ModalityType.TEXT;
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
