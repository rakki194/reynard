/**
 * Multimodal Components Barrel Export
 *
 * Provides clean API boundaries for all multimodal gallery components.
 */

// Core Multimodal Components
export { MultiModalGallery } from "./MultiModalGallery";
export { MultiModalGalleryView } from "./MultiModalGalleryView";
export { MultiModalGalleryHeader } from "./MultiModalGalleryHeader";
export { MultiModalGalleryContent } from "./MultiModalGalleryContent";
export { MultiModalGrid } from "./MultiModalGrid";
export { MultiModalList } from "./MultiModalList";
export { MultiModalTimeline } from "./MultiModalTimeline";
export { MultiModalFileCard } from "./MultiModalFileCard";
export { MultiModalFileThumbnail } from "./MultiModalFileThumbnail";
export { MultiModalFileInfo } from "./MultiModalFileInfo";
export { MultiModalFileRow } from "./MultiModalFileRow";
export { MultiModalDetail } from "./MultiModalDetail";

// Re-export types for convenience
export type {
  MultiModalGalleryProps,
  MultiModalGridProps,
  MultiModalListProps,
  MultiModalTimelineProps,
  MultiModalFileCardProps,
  MultiModalFileRowProps,
  MultiModalDetailProps,
  MultiModalFile,
  MediaType,
  GalleryView,
  FileCounts,
} from "../types";
