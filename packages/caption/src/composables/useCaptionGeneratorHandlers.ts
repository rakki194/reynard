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
  manager: import("reynard-annotating").BackendAnnotationManager | null,
  onCaptionGenerated?: (result: import("reynard-annotating-core").CaptionResult) => void,
  onGenerationError?: (error: Error) => void
): CaptionGeneratorHandlers {
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      state.setError("Please select a valid image file");
      return;
    }
    state.setImageFile(file);
    state.setError(null);
    state.setResult(null);
    const reader = new FileReader();
    reader.onload = e => {
      state.setImagePreview((e.target?.result as string) || null);
    };
    reader.readAsDataURL(file);
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
    if (!state.imageFile() || !manager) return;
    state.setIsGenerating(true);
    state.setGenerationProgress(0);
    state.setError(null);
    state.setResult(null);

    try {
      const task: import("reynard-annotating-core").CaptionTask = {
        imagePath: state.imageFile()!.name,
        generatorName: state.selectedModel(),
        config: { threshold: 0.2 },
        postProcess: true,
      };

      const progressInterval = setInterval(() => {
        state.setGenerationProgress(Math.min(state.generationProgress() + 10, 90));
      }, 200);

      const captionResult = await manager.getService().generateCaption(task);
      clearInterval(progressInterval);
      state.setGenerationProgress(100);
      state.setResult(captionResult);
      onCaptionGenerated?.(captionResult);
    } catch (err) {
      state.setError(`Generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      onGenerationError?.(err as Error);
    } finally {
      state.setIsGenerating(false);
      setTimeout(() => state.setGenerationProgress(0), 1000);
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
