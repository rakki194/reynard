/**
 * File Processing Composable
 *
 * Handles file upload and processing logic for the multi-modal gallery.
 */

import { createSignal } from "solid-js";
import type { MultiModalFile } from "../types/MultiModalTypes";
import { processFile, createFileProcessingPipeline } from "../utils/FileProcessingUtils";
import { useI18n } from "reynard-i18n";

export interface UseFileProcessingReturn {
  isLoading: () => boolean;
  error: () => string | null;
  processFileWrapper: (file: File) => Promise<MultiModalFile>;
  processingPipeline: ReturnType<typeof createFileProcessingPipeline>;
}

export const useFileProcessing = (): UseFileProcessingReturn => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const { t } = useI18n();

  const processingPipeline = createFileProcessingPipeline();

  const processFileWrapper = async (file: File): Promise<MultiModalFile> => {
    setIsLoading(true);
    setError(null);

    try {
      return await processFile(file, processingPipeline);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("caption.errors.failedToProcessFile");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    processFileWrapper,
    processingPipeline,
  };
};
