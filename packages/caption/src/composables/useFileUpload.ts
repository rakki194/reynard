/**
 * File Upload Composable
 * 
 * Handles file upload logic for the multi-modal gallery.
 */

import type { MultiModalFile } from "../types/MultiModalTypes";
import { useFileProcessing } from "./useFileProcessing";

export interface UseFileUploadReturn {
  isLoading: () => boolean;
  error: () => string | null;
  handleFileUpload: (event: Event, setFiles: (files: MultiModalFile[] | ((prev: MultiModalFile[]) => MultiModalFile[])) => void, maxFiles?: number) => Promise<void>;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const { isLoading, error, processFileWrapper } = useFileProcessing();

  const handleFileUpload = async (
    event: Event,
    setFiles: (files: MultiModalFile[] | ((prev: MultiModalFile[]) => MultiModalFile[])) => void,
    maxFiles: number = 50
  ): Promise<void> => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (!files || files.length === 0) return;

    const filesToProcess = Array.from(files).slice(0, maxFiles);

    try {
      const processedFiles = await Promise.all(
        filesToProcess.map(processFileWrapper)
      );

      setFiles(prev => [...prev, ...processedFiles]);
    } catch (err) {
      console.error("Failed to process files:", err);
    }
  };

  return {
    isLoading,
    error,
    handleFileUpload
  };
};
