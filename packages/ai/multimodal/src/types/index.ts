/**
 * Multi-Modal Types for Reynard Caption System
 *
 * Type definitions for multi-modal gallery components,
 * leveraging existing file processing infrastructure.
 */

export type MediaType = "image" | "video" | "audio" | "text" | "document" | "unknown";

export type GalleryView = "grid" | "list" | "timeline";

export interface MultiModalFile {
  /** Unique identifier for the file */
  id: string;
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** Detected media type */
  fileType: MediaType;
  /** URL for file access */
  url: string;
  /** Generated thumbnail blob */
  thumbnail?: Blob;
  /** Extracted metadata */
  metadata?: any;
  /** File content (for text files) */
  content?: any;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Last modification timestamp */
  modifiedAt: Date;
}

export interface MultiModalGalleryState {
  /** Currently selected file */
  selectedFile: MultiModalFile | null;
  /** List of all files */
  files: MultiModalFile[];
  /** Current view mode */
  currentView: GalleryView;
  /** Current filter type */
  filterType: MediaType | "all";
  /** Whether processing is in progress */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Upload progress for batch operations */
  uploadProgress: Record<string, number>;
}

export interface FileTypeInfo {
  /** Media type */
  type: MediaType;
  /** MIME type */
  mimeType: string;
  /** File extension */
  extension: string;
  /** Display icon */
  icon: string;
  /** Human-readable name */
  name: string;
  /** Whether type supports thumbnails */
  supportsThumbnails: boolean;
  /** Whether type supports editing */
  supportsEditing: boolean;
  /** Whether type supports preview */
  supportsPreview: boolean;
}

export interface GalleryFilter {
  /** Filter by media type */
  type?: MediaType | "all";
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Filter by file size range */
  sizeRange?: {
    min: number;
    max: number;
  };
  /** Filter by filename pattern */
  namePattern?: string;
  /** Filter by tags */
  tags?: string[];
}

export interface GallerySort {
  /** Sort field */
  field: "name" | "size" | "date" | "type";
  /** Sort direction */
  direction: "asc" | "desc";
}

export interface GalleryViewOptions {
  /** Grid view options */
  grid?: {
    /** Number of columns */
    columns?: number;
    /** Card size */
    cardSize?: "small" | "medium" | "large";
    /** Whether to show thumbnails */
    showThumbnails?: boolean;
    /** Whether to show metadata */
    showMetadata?: boolean;
  };
  /** List view options */
  list?: {
    /** Whether to show thumbnails */
    showThumbnails?: boolean;
    /** Whether to show metadata */
    showMetadata?: boolean;
    /** Row height */
    rowHeight?: number;
  };
  /** Timeline view options */
  timeline?: {
    /** Grouping period */
    grouping?: "day" | "week" | "month" | "year";
    /** Whether to show thumbnails */
    showThumbnails?: boolean;
    /** Whether to show metadata */
    showMetadata?: boolean;
  };
}

export interface MultiModalGalleryConfig {
  /** Maximum number of files */
  maxFiles?: number;
  /** Supported file types */
  supportedTypes?: MediaType[];
  /** Maximum file size */
  maxFileSize?: number;
  /** Whether to enable drag and drop */
  enableDragDrop?: boolean;
  /** Whether to enable batch operations */
  enableBatchOperations?: boolean;
  /** Whether to enable file editing */
  enableEditing?: boolean;
  /** Default view mode */
  defaultView?: GalleryView;
  /** View options */
  viewOptions?: GalleryViewOptions;
  /** Initial filter */
  initialFilter?: GalleryFilter;
  /** Initial sort */
  initialSort?: GallerySort;
}

export interface FileProcessingResult {
  /** Whether processing was successful */
  success: boolean;
  /** Processed file data */
  data?: {
    thumbnail?: Blob;
    metadata?: any;
    content?: any;
  };
  /** Error message if processing failed */
  error?: string;
  /** Processing duration in milliseconds */
  duration: number;
  /** Processing timestamp */
  timestamp: Date;
}

export interface BatchOperation {
  /** Operation type */
  type: "upload" | "delete" | "move" | "copy" | "rename";
  /** Target files */
  files: MultiModalFile[];
  /** Operation parameters */
  params?: any;
  /** Callback for progress updates */
  onProgress?: (progress: number) => void;
  /** Callback for completion */
  onComplete?: (result: any) => void;
  /** Callback for errors */
  onError?: (error: Error) => void;
}

export interface GalleryEvent {
  /** Event type */
  type: "fileSelect" | "fileRemove" | "fileModify" | "viewChange" | "filterChange";
  /** Event data */
  data: any;
  /** Event timestamp */
  timestamp: Date;
}

export interface GalleryStats {
  /** Total number of files */
  totalFiles: number;
  /** Files by type */
  filesByType: Record<MediaType, number>;
  /** Total size in bytes */
  totalSize: number;
  /** Average file size */
  averageSize: number;
  /** Date range */
  dateRange: {
    earliest: Date;
    latest: Date;
  };
  /** Most common file types */
  mostCommonTypes: Array<{
    type: MediaType;
    count: number;
    percentage: number;
  }>;
}

/** File counts by type */
export type FileCounts = Record<MediaType, number>;

/**
 * Represents a content modality (image, video, text, audio, etc.)
 */
export interface Modality {
  /** Unique identifier for the modality */
  id: string;
  /** Human-readable name */
  name: string;
  /** Icon identifier for the modality */
  icon: string;
  /** Description of the modality */
  description: string;
  /** Whether this modality is currently enabled */
  enabled: boolean;
  /** File extensions supported by this modality */
  fileExtensions: string[];
  /** Functionalities that work with this modality */
  supportedFunctionalities: string[];
  /** Component to render for this modality */
  component: any;
  /** Validation function for files */
  validateFile: (file: File) => boolean;
  /** Get supported file types */
  getSupportedFileTypes: () => string[];
}

/**
 * Props passed to modality components
 */
export interface ModalityProps {
  /** The modality instance */
  modality: Modality;
  /** Whether the modality is active */
  isActive: boolean;
  /** Function to activate this modality */
  activate: () => void;
  /** Function to deactivate this modality */
  deactivate: () => void;
  /** Current path */
  path: string;
  /** Additional props */
  [key: string]: any;
}

/**
 * Predefined modality IDs
 */
export const MODALITY_IDS = {
  IMAGE: "image",
  VIDEO: "video",
  TEXT: "text",
  AUDIO: "audio",
  CODE: "code",
  LORA: "lora",
} as const;

/**
 * Predefined functionality IDs
 */
export const FUNCTIONALITY_IDS = {
  SCRIPT_EDITING: "script-editing",
  CODE_EDITOR: "code-editor",
  LORA_ANALYSIS: "lora-analysis",
  BATCH_PROCESSING: "batch-processing",
  DATA_ANALYSIS: "data-analysis",
  EXPORT: "export",
  IMPORT: "import",
  RAG: "rag",
} as const;

/**
 * Type for modality ID
 */
export type ModalityId = (typeof MODALITY_IDS)[keyof typeof MODALITY_IDS];

/**
 * Type for functionality ID
 */
export type FunctionalityId = (typeof FUNCTIONALITY_IDS)[keyof typeof FUNCTIONALITY_IDS];
