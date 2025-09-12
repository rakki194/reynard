/**
 * Text File Manager Composable for Reynard Caption System
 *
 * Handles text file state management and operations.
 */

import { createSignal } from "solid-js";
import { TextFile } from "../types/TextTypes";

export interface UseTextFileManagerOptions {
  initialFiles?: TextFile[];
  onFileSelect?: (file: TextFile) => void;
  onFileRemove?: (fileId: string) => void;
  onFileModify?: (fileId: string, content: string) => void;
}

export const useTextFileManager = (options: UseTextFileManagerOptions = {}) => {
  const [textFiles, setTextFiles] = createSignal<TextFile[]>(
    options.initialFiles || [],
  );
  const [selectedFile, setSelectedFile] = createSignal<TextFile | null>(null);

  // Handle file selection
  const handleFileSelect = (file: TextFile) => {
    setSelectedFile(file);
    options.onFileSelect?.(file);
  };

  // Handle file removal
  const handleFileRemove = (fileId: string) => {
    setTextFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFile()?.id === fileId) {
      setSelectedFile(null);
    }
    options.onFileRemove?.(fileId);
  };

  // Handle file content modification
  const handleFileModify = (fileId: string, content: string) => {
    setTextFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, content, modifiedAt: new Date() } : f,
      ),
    );
    options.onFileModify?.(fileId, content);
  };

  // Add new files
  const addFiles = (newFiles: TextFile[]) => {
    setTextFiles((prev) => [...prev, ...newFiles]);
  };

  return {
    textFiles,
    selectedFile,
    setSelectedFile,
    handleFileSelect,
    handleFileRemove,
    handleFileModify,
    addFiles,
  };
};
