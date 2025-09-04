/**
 * Gallery Types and Interfaces
 */

export interface FileItem {
  /** Unique identifier */
  id: string;
  /** File name */
  name: string;
  /** File type */
  type: "image" | "video" | "audio" | "text" | "folder" | "unknown";
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType?: string;
  /** Last modified timestamp */
  lastModified: number;
  /** File path */
  path: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Preview URL */
  previewUrl?: string;
  /** Download URL */
  downloadUrl?: string;
  /** Whether file is selected */
  selected?: boolean;
  /** Whether file is favorited */
  favorited?: boolean;
  /** File metadata */
  metadata?: FileMetadata;
}

export interface FileMetadata {
  /** Image/video dimensions */
  width?: number;
  height?: number;
  /** Duration for video/audio */
  duration?: number;
  /** Frame rate for video */
  frameRate?: number;
  /** Aspect ratio */
  aspectRatio?: number;
  /** Whether media is animated */
  animated?: boolean;
  /** Color profile information */
  colorProfile?: string;
  /** EXIF data for images */
  exif?: Record<string, any>;
  /** Custom tags */
  tags?: string[];
  /** User-defined metadata */
  custom?: Record<string, any>;
}

export interface FolderItem extends Omit<FileItem, "type" | "size" | "mimeType"> {
  type: "folder";
  /** Number of items in folder */
  itemCount?: number;
  /** Folder permissions */
  permissions?: FolderPermissions;
}

export interface FolderPermissions {
  /** Can read folder contents */
  read: boolean;
  /** Can write/upload to folder */
  write: boolean;
  /** Can delete items */
  delete: boolean;
  /** Can create subfolders */
  createFolder: boolean;
}

export interface GalleryData {
  /** Current folder path */
  path: string;
  /** Items in current folder */
  items: (FileItem | FolderItem)[];
  /** Total number of items */
  totalItems: number;
  /** Current page (for pagination) */
  currentPage?: number;
  /** Items per page */
  itemsPerPage?: number;
  /** Whether there are more items to load */
  hasMore?: boolean;
  /** Folder metadata */
  folderMetadata?: {
    name: string;
    size: number;
    lastModified: number;
    permissions: FolderPermissions;
  };
}

export interface ViewConfiguration {
  /** Grid layout mode */
  layout: "grid" | "list" | "masonry";
  /** Items per row (grid mode) */
  itemsPerRow?: number;
  /** Item size */
  itemSize: "small" | "medium" | "large" | "xl";
  /** Show thumbnails */
  showThumbnails: boolean;
  /** Show file names */
  showFileNames: boolean;
  /** Show file sizes */
  showFileSizes: boolean;
  /** Show metadata overlay */
  showMetadata: boolean;
  /** Enable infinite scroll */
  infiniteScroll: boolean;
}

export interface SortConfiguration {
  /** Sort field */
  field: "name" | "size" | "lastModified" | "type" | "favorite";
  /** Sort direction */
  direction: "asc" | "desc";
}

export interface FilterConfiguration {
  /** File types to show */
  fileTypes: string[];
  /** Date range filter */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Size range filter */
  sizeRange?: {
    min: number;
    max: number;
  };
  /** Text search query */
  searchQuery?: string;
  /** Show only favorites */
  favoritesOnly: boolean;
  /** Show hidden files */
  showHidden: boolean;
}

export interface SelectionState {
  /** Selected item IDs */
  selectedIds: Set<string>;
  /** Last selected item ID */
  lastSelectedId?: string;
  /** Selection mode */
  mode: "none" | "single" | "multiple";
  /** Whether selection is active */
  active: boolean;
}

export interface UploadConfiguration {
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Maximum total upload size */
  maxTotalSize?: number;
  /** Allowed file types */
  allowedTypes: string[];
  /** Whether to allow multiple files */
  multiple: boolean;
  /** Whether to allow folders */
  allowFolders: boolean;
  /** Auto-generate thumbnails */
  generateThumbnails: boolean;
  /** Upload endpoint URL */
  uploadUrl: string;
  /** Additional upload headers */
  headers?: Record<string, string>;
}

export interface UploadProgress {
  /** Upload ID */
  id: string;
  /** File being uploaded */
  file: File;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: "pending" | "uploading" | "completed" | "error" | "cancelled";
  /** Error message if failed */
  error?: string;
  /** Upload speed in bytes/second */
  speed?: number;
  /** Estimated time remaining in seconds */
  timeRemaining?: number;
}

export interface ContextMenuAction {
  /** Action ID */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: string;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Whether action is destructive */
  destructive?: boolean;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Action handler */
  handler: (items: (FileItem | FolderItem)[]) => void;
}

export interface GalleryTheme {
  /** Grid background color */
  gridBackground: string;
  /** Item background color */
  itemBackground: string;
  /** Item hover background */
  itemHoverBackground: string;
  /** Selected item background */
  selectedBackground: string;
  /** Border color */
  borderColor: string;
  /** Text color */
  textColor: string;
  /** Secondary text color */
  secondaryTextColor: string;
  /** Accent color */
  accentColor: string;
  /** Error color */
  errorColor: string;
  /** Success color */
  successColor: string;
}

export interface GalleryConfiguration {
  /** View settings */
  view: ViewConfiguration;
  /** Sort settings */
  sort: SortConfiguration;
  /** Filter settings */
  filter: FilterConfiguration;
  /** Upload settings */
  upload: UploadConfiguration;
  /** Theme settings */
  theme?: Partial<GalleryTheme>;
  /** Custom context menu actions */
  contextMenuActions?: ContextMenuAction[];
  /** Whether to enable keyboard shortcuts */
  enableKeyboardShortcuts: boolean;
  /** Whether to enable drag and drop */
  enableDragAndDrop: boolean;
  /** Whether to enable virtual scrolling */
  enableVirtualScrolling: boolean;
}

export interface GalleryCallbacks {
  /** Called when items are selected */
  onSelectionChange?: (selectedItems: (FileItem | FolderItem)[]) => void;
  /** Called when an item is opened */
  onItemOpen?: (item: FileItem | FolderItem) => void;
  /** Called when an item is double-clicked */
  onItemDoubleClick?: (item: FileItem | FolderItem) => void;
  /** Called when navigation occurs */
  onNavigate?: (path: string) => void;
  /** Called when upload starts */
  onUploadStart?: (files: File[]) => void;
  /** Called when upload progresses */
  onUploadProgress?: (progress: UploadProgress[]) => void;
  /** Called when upload completes */
  onUploadComplete?: (results: UploadProgress[]) => void;
  /** Called when files are deleted */
  onDelete?: (items: (FileItem | FolderItem)[]) => void;
  /** Called when files are moved */
  onMove?: (items: (FileItem | FolderItem)[], destination: string) => void;
  /** Called when folder is created */
  onCreateFolder?: (name: string, path: string) => void;
  /** Called when item is favorited */
  onFavorite?: (item: FileItem | FolderItem, favorited: boolean) => void;
  /** Called when error occurs */
  onError?: (error: string, details?: any) => void;
}

export interface BreadcrumbItem {
  /** Path segment */
  path: string;
  /** Display label */
  label: string;
  /** Whether segment is clickable */
  clickable: boolean;
}

export interface MediaViewerState {
  /** Whether viewer is open */
  isOpen: boolean;
  /** Current item being viewed */
  currentItem?: FileItem;
  /** List of items for navigation */
  items?: FileItem[];
  /** Current index in items */
  currentIndex?: number;
  /** Whether to show controls */
  showControls: boolean;
  /** Whether to loop at end */
  loop: boolean;
  /** Auto-play for videos */
  autoPlay: boolean;
}

export interface ThumbnailOptions {
  /** Thumbnail width */
  width: number;
  /** Thumbnail height */
  height: number;
  /** Image quality (0-100) */
  quality?: number;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Background color for letterboxing */
  backgroundColor?: string;
  /** Image format */
  format?: "webp" | "jpeg" | "png";
}

// Default configurations
export const DEFAULT_VIEW_CONFIG: ViewConfiguration = {
  layout: "grid",
  itemsPerRow: 4,
  itemSize: "medium",
  showThumbnails: true,
  showFileNames: true,
  showFileSizes: false,
  showMetadata: false,
  infiniteScroll: true,
};

export const DEFAULT_SORT_CONFIG: SortConfiguration = {
  field: "name",
  direction: "asc",
};

export const DEFAULT_FILTER_CONFIG: FilterConfiguration = {
  fileTypes: [],
  favoritesOnly: false,
  showHidden: false,
};

export const DEFAULT_UPLOAD_CONFIG: UploadConfiguration = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ["image/*", "video/*", "audio/*", "text/*"],
  multiple: true,
  allowFolders: false,
  generateThumbnails: true,
  uploadUrl: "/api/upload",
};

export const DEFAULT_SELECTION_STATE: SelectionState = {
  selectedIds: new Set(),
  mode: "multiple",
  active: false,
};

export const DEFAULT_GALLERY_THEME: GalleryTheme = {
  gridBackground: "var(--background)",
  itemBackground: "var(--surface)",
  itemHoverBackground: "var(--surface-hover)",
  selectedBackground: "var(--accent-surface)",
  borderColor: "var(--border)",
  textColor: "var(--text-primary)",
  secondaryTextColor: "var(--text-secondary)",
  accentColor: "var(--accent)",
  errorColor: "var(--error)",
  successColor: "var(--success)",
};




