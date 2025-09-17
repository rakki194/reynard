/**
 * Text File Upload Composable for Reynard Caption System
 *
 * Handles file upload logic and processing for text files.
 */

import { createSignal } from "solid-js";
import { TextFile } from "../types/TextTypes";
import { processTextFile } from "../utils/textFileUtils";

export interface UseTextFileUploadOptions {
  maxFiles?: number;
  onError?: (error: string) => void;
}

export const useTextFileUpload = (options: UseTextFileUploadOptions = {}) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Process uploaded files with error handling
  const processFileWithErrorHandling = async (file: File): Promise<TextFile> => {
    setIsLoading(true);
    setError(null);

    try {
      return await processTextFile(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process text file";
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: Event): Promise<TextFile[]> => {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return [];

    const maxFiles = options.maxFiles || 10;
    const filesToProcess = Array.from(files).slice(0, maxFiles);

    try {
      return await Promise.all(filesToProcess.map(processFileWithErrorHandling));
    } catch (err) {
      console.error("Failed to process text files:", err);
      return [];
    }
  };

  return {
    isLoading,
    error,
    handleFileUpload,
    setError,
  };
};
