/**
 * Type definitions for Multi-Modal Gallery System
 *
 * Centralized type definitions for consistent interfaces across
 * all multi-modal gallery components.
 *
 * Note: These types will be replaced with generated types from the API client
 * once the backend caption system is fully integrated.
 */

export type MediaType = "image" | "video" | "audio" | "text" | "document" | "unknown";
export type GalleryView = "grid" | "list" | "timeline";

export interface MultiModalFile {
  id: string;
  name: string;
  size: number;
  type: string;
  fileType: MediaType;
  url: string;
  thumbnail?: Blob;
  metadata?: unknown;
  content?: unknown;
  uploadedAt: Date;
  modifiedAt: Date;
}

export interface MultiModalGalleryProps {
  /** Initial files to display */
  initialFiles?: MultiModalFile[];
  /** Callback when files are selected */
  onFileSelect?: (file: MultiModalFile) => void;
  /** Callback when files are removed */
  onFileRemove?: (fileId: string) => void;
  /** Callback when files are modified */
  onFileModify?: (fileId: string, content: unknown) => void;
  /** Maximum number of files to display */
  maxFiles?: number;
  /** Default view mode */
  defaultView?: GalleryView;
  /** Whether to show file metadata */
  showMetadata?: boolean;
  /** Whether to enable editing */
  editable?: boolean;
  /** Custom CSS class */
  class?: string;
}

export interface MultiModalGridProps {
  files: MultiModalFile[];
  selectedFile: MultiModalFile | null;
  onFileSelect: (file: MultiModalFile) => void;
  onFileRemove: (fileId: string) => void;
  showMetadata?: boolean;
}

export interface MultiModalListProps {
  files: MultiModalFile[];
  selectedFile: MultiModalFile | null;
  onFileSelect: (file: MultiModalFile) => void;
  onFileRemove: (fileId: string) => void;
  showMetadata?: boolean;
}

export interface MultiModalTimelineProps {
  files: MultiModalFile[];
  selectedFile: MultiModalFile | null;
  onFileSelect: (file: MultiModalFile) => void;
  onFileRemove: (fileId: string) => void;
  showMetadata?: boolean;
}

export interface MultiModalFileCardProps {
  file: MultiModalFile;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  showMetadata?: boolean;
  size?: "small" | "medium" | "large";
}

export interface MultiModalFileRowProps {
  file: MultiModalFile;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  showMetadata?: boolean;
}

export interface MultiModalDetailProps {
  file: MultiModalFile;
  onClose: () => void;
  onModify: (content: unknown) => void;
  editable?: boolean;
}

export interface FileCounts {
  all: number;
  image: number;
  video: number;
  audio: number;
  text: number;
  document: number;
}
