/**
 * Gallery Grid Component
 * Responsive grid layout for displaying files and folders
 */
import { Component } from "solid-js";
import type {
  FileItem,
  FolderItem,
  ViewConfiguration,
  SelectionState,
  GalleryCallbacks,
} from "../types";
export interface GalleryGridProps {
  /** Items to display */
  items: (FileItem | FolderItem)[];
  /** View configuration */
  viewConfig: ViewConfiguration;
  /** Selection state */
  selectionState: SelectionState;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Callbacks */
  onItemClick?: GalleryCallbacks["onItemOpen"];
  onItemDoubleClick?: GalleryCallbacks["onItemDoubleClick"];
  onSelectionChange?: (
    item: FileItem | FolderItem,
    mode: "single" | "add" | "range",
  ) => void;
  onContextMenu?: (item: FileItem | FolderItem, x: number, y: number) => void;
  /** Custom class name */
  class?: string;
}
export declare const GalleryGrid: Component<GalleryGridProps>;
