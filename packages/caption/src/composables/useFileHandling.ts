/**
 * File Handling Composable
 * 
 * Handles file state management and operations for the multi-modal gallery.
 */

import { createSignal, createMemo } from "solid-js";
import type { MultiModalFile, MediaType, GalleryView } from "../types/MultiModalTypes";
import { calculateFileCounts } from "../utils/FileProcessingUtils";

export interface UseFileHandlingReturn {
  files: () => MultiModalFile[];
  setFiles: (files: MultiModalFile[] | ((prev: MultiModalFile[]) => MultiModalFile[])) => void;
  selectedFile: () => MultiModalFile | null;
  setSelectedFile: (file: MultiModalFile | null) => void;
  currentView: () => GalleryView;
  setCurrentView: (view: GalleryView) => void;
  filterType: () => MediaType | "all";
  setFilterType: (type: MediaType | "all") => void;
  filteredFiles: () => MultiModalFile[];
  fileCounts: () => ReturnType<typeof calculateFileCounts>;
  handleFileSelect: (file: MultiModalFile) => void;
  handleFileRemove: (fileId: string) => void;
  handleFileModify: (fileId: string, content: unknown) => void;
}

export const useFileHandling = (
  initialFiles: MultiModalFile[] = [],
  defaultView: GalleryView = "grid",
  onFileSelect?: (file: MultiModalFile) => void,
  onFileRemove?: (fileId: string) => void,
  onFileModify?: (fileId: string, content: unknown) => void
): UseFileHandlingReturn => {
  const [files, setFiles] = createSignal<MultiModalFile[]>(initialFiles);
  const [selectedFile, setSelectedFile] = createSignal<MultiModalFile | null>(null);
  const [currentView, setCurrentView] = createSignal<GalleryView>(defaultView);
  const [filterType, setFilterType] = createSignal<MediaType | "all">("all");

  // Filtered files based on current filter
  const filteredFiles = createMemo(() => {
    const allFiles = files();
    if (filterType() === "all") return allFiles;
    return allFiles.filter(file => file.fileType === filterType());
  });

  // File counts by type
  const fileCounts = createMemo(() => calculateFileCounts(files()));

  // Handle file selection
  const handleFileSelect = (file: MultiModalFile) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  // Handle file removal
  const handleFileRemove = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile()?.id === fileId) {
      setSelectedFile(null);
    }
    onFileRemove?.(fileId);
  };

  // Handle file modification
  const handleFileModify = (fileId: string, content: unknown) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, content, modifiedAt: new Date() } : f
    ));
    onFileModify?.(fileId, content);
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
    handleFileModify
  };
};
