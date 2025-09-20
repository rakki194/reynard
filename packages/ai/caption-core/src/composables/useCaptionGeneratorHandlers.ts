/**
 * Caption Generator Event Handlers Composable
 *
 * Manages all event handlers for the caption generator component.
 * Extracted to keep the main component under the 140-line limit.
 */

import type { CaptionGeneratorState } from "./useCaptionGeneratorState";

export interface CaptionGeneratorHandlers {
  handleFileSelect: (file: File) => void;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => void;
  generateCaption: () => Promise<void>;
}

/**
 * Creates event handlers for the caption generator
 */
export function useCaptionGeneratorHandlers(
  state: CaptionGeneratorState,
  manager: any | null,
  onCaptionGenerated?: (result: any) => void,
  onGenerationError?: (error: Error) => void
): CaptionGeneratorHandlers {
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      state.setError("Please select a valid image file");
      return;
    }

    state.setImageFile(file);
    state.setError(null);

    // Create preview URL
    const preview = URL.createObjectURL(file);
    state.setImagePreview(preview);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    state.setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    state.setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    state.setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const generateCaption = async () => {
    if (!state.imageFile()) {
      state.setError("Please select an image first");
      return;
    }

    if (!manager) {
      state.setError("Caption generator is not available");
      return;
    }

    try {
      state.setIsGenerating(true);
      state.setError(null);
      state.setGenerationProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        const currentProgress = state.generationProgress();
        if (currentProgress < 90) {
          state.setGenerationProgress(currentProgress + 10);
        }
      }, 200);

      // Generate caption
      const result = await manager.generateCaption(state.imageFile()!);

      clearInterval(progressInterval);
      state.setGenerationProgress(100);
      state.setResult(result);
      onCaptionGenerated?.(result);
    } catch (error) {
      state.setError(error instanceof Error ? error.message : "Failed to generate caption");
      onGenerationError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      state.setIsGenerating(false);
    }
  };

  return {
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    generateCaption,
  };
}
