/**
 * File Handling Composable for Multi-Modal Gallery
 *
 * Provides state management and utilities for handling files in the gallery.
 */

import { createSignal, createMemo } from "solid-js";
import type { MultiModalFile, GalleryView, MediaType } from "../types";

export interface UseFileHandlingReturn {
  files: () => MultiModalFile[];
  setFiles: (files: MultiModalFile[]) => void;
  selectedFile: () => MultiModalFile | null;
  setSelectedFile: (file: MultiModalFile | null) => void;
  currentView: () => GalleryView;
  setCurrentView: (view: GalleryView) => void;
  filterType: () => MediaType | "all";
  setFilterType: (type: MediaType | "all") => void;
  filteredFiles: () => MultiModalFile[];
  fileCounts: () => Record<MediaType, number>;
  handleFileSelect: (file: MultiModalFile) => void;
  handleFileRemove: (file: MultiModalFile) => void;
  handleFileModify: (file: MultiModalFile) => void;
}

export function useFileHandling(
  initialFiles: MultiModalFile[] = [],
  defaultView: GalleryView = "grid",
  onFileSelect?: (file: MultiModalFile) => void,
  onFileRemove?: (file: MultiModalFile) => void,
  onFileModify?: (file: MultiModalFile) => void
): UseFileHandlingReturn {
  const [files, setFiles] = createSignal<MultiModalFile[]>(initialFiles);
  const [selectedFile, setSelectedFile] = createSignal<MultiModalFile | null>(null);
  const [currentView, setCurrentView] = createSignal<GalleryView>(defaultView);
  const [filterType, setFilterType] = createSignal<MediaType | "all">("all");

  // Computed values
  const filteredFiles = createMemo(() => {
    const currentFilter = filterType();
    if (currentFilter === "all") {
      return files();
    }
    return files().filter(file => file.fileType === currentFilter);
  });

  const fileCounts = createMemo(() => {
    const counts: Record<MediaType, number> = {
      image: 0,
      video: 0,
      audio: 0,
      text: 0,
      document: 0,
      unknown: 0,
    };

    files().forEach(file => {
      counts[file.fileType] = (counts[file.fileType] || 0) + 1;
    });

    return counts;
  });

  // Event handlers
  const handleFileSelect = (file: MultiModalFile) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleFileRemove = (file: MultiModalFile) => {
    setFiles(files().filter(f => f.id !== file.id));
    if (selectedFile()?.id === file.id) {
      setSelectedFile(null);
    }
    onFileRemove?.(file);
  };

  const handleFileModify = (file: MultiModalFile) => {
    setFiles(files().map(f => (f.id === file.id ? file : f)));
    if (selectedFile()?.id === file.id) {
      setSelectedFile(file);
    }
    onFileModify?.(file);
  };

  return {
    files,
    setFiles,
    selectedFile,
    setSelectedFile,
    currentView,
    setCurrentView,
    filterType,
    setFilterType,
    filteredFiles,
    fileCounts,
    handleFileSelect,
    handleFileRemove,
    handleFileModify,
  };
}
