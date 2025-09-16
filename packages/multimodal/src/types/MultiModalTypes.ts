/**
 * Multi-Modal Gallery Props and Component Types
 *
 * Type definitions for the MultiModalGallery component and related props.
 */

import type { MultiModalFile, GalleryView, MediaType } from "./index";

export interface MultiModalGalleryProps {
  /** Initial files to display */
  initialFiles?: MultiModalFile[];
  /** Default view mode */
  defaultView?: GalleryView;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Whether to show metadata */
  showMetadata?: boolean;
  /** Whether files are editable */
  editable?: boolean;
  /** Custom CSS class */
  class?: string;
  /** Callback when a file is selected */
  onFileSelect?: (file: MultiModalFile) => void;
  /** Callback when a file is removed */
  onFileRemove?: (file: MultiModalFile) => void;
  /** Callback when a file is modified */
  onFileModify?: (file: MultiModalFile) => void;
  /** Callback when view changes */
  onViewChange?: (view: GalleryView) => void;
  /** Callback when filter changes */
  onFilterChange?: (filter: MediaType | "all") => void;
}

export interface MultiModalGalleryViewProps {
  /** File counts by type */
  fileCounts: Record<MediaType, number>;
  /** Current filter type */
  filterType: MediaType | "all";
  /** Callback when filter changes */
  onFilterChange: (filter: MediaType | "all") => void;
  /** Current view mode */
  currentView: GalleryView;
  /** Callback when view changes */
  onViewChange: (view: GalleryView) => void;
  /** Callback for file upload */
  onFileUpload: (event: Event) => void;
  /** Whether upload is in progress */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Filtered files to display */
  filteredFiles: MultiModalFile[];
  /** Currently selected file */
  selectedFile: MultiModalFile | null;
  /** Callback when a file is selected */
  onFileSelect: (file: MultiModalFile) => void;
  /** Callback when a file is removed */
  onFileRemove: (file: MultiModalFile) => void;
  /** Callback when a file is modified */
  onFileModify: (file: MultiModalFile) => void;
  /** Callback to close detail view */
  onCloseDetail: () => void;
  /** Whether to show metadata */
  showMetadata?: boolean;
  /** Whether files are editable */
  editable?: boolean;
  /** Custom CSS class */
  class?: string;
}
