/**
 * Application event handlers composable
 */

import type { ImageItem } from "../types";
import { AppLogicService } from "../services/appLogic";
import type { UseAppStateReturn } from "./useAppState";
import type { UseWorkflowReturn } from "./useWorkflow";

export interface UseAppHandlersReturn {
  handleFileUpload: (files: File[]) => void;
  generateCaption: (image: ImageItem) => Promise<void>;
  batchGenerateCaptions: () => Promise<void>;
  saveCaption: () => void;
  deleteImage: (imageId: string) => void;
  updateSystemStats: () => Promise<void>;
}

/**
 * Composable for managing application event handlers
 */
export function useAppHandlers(
  appState: UseAppStateReturn,
  workflow: UseWorkflowReturn,
  appLogic: AppLogicService,
  notify: (
    message: string,
    type?: "error" | "success" | "info" | "warning",
  ) => void,
): UseAppHandlersReturn {
  const updateSystemStats = async () => {
    try {
      const stats = await appLogic.updateSystemStats();
      if (stats) {
        appState.setSystemStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
    }
  };

  const handleFileUpload = (files: File[]) => {
    const newImages = appLogic.handleFileUpload(files);
    appState.setImages((prev) => [...prev, ...newImages]);
    notify(`Added ${files.length} image(s) to gallery`, "success");
  };

  const generateCaption = async (image: ImageItem) => {
    appState.setIsGenerating(true);
    workflow.startWorkflow(image, true);

    try {
      const result = await appLogic.generateCaption(
        image,
        appState.selectedModel(),
      );

      if (result.success) {
        const generatedCaption = result.caption || "No caption generated";
        const extractedTags = generatedCaption
          .split(/[,\s]+/)
          .filter((tag: string) => tag.length > 2);

        workflow.updateWorkflow({
          generatedCaption,
          editedCaption: generatedCaption,
          tags: extractedTags,
          isGenerating: false,
        });

        const updatedImages = appLogic.updateImageCaption(
          appState.images(),
          image.id,
          generatedCaption,
          extractedTags,
        );
        appState.setImages(
          updatedImages.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  generatedAt: new Date(),
                  model: appState.selectedModel(),
                }
              : img,
          ),
        );

        notify(
          `Caption generated successfully in ${result.processingTime?.toFixed(2)}s!`,
          "success",
        );
      } else {
        notify(`Caption generation failed: ${result.error}`, "error");
      }
    } catch (error) {
      workflow.updateWorkflow({ isGenerating: false });
      notify("Failed to generate caption", "error");
      console.error("Caption generation failed:", error);
    } finally {
      appState.setIsGenerating(false);
      await updateSystemStats();
    }
  };

  const batchGenerateCaptions = async () => {
    const imagesToProcess = appState.images().filter((img) => !img.caption);
    if (imagesToProcess.length === 0) {
      notify("No images need captioning", "info");
      return;
    }

    appState.setIsGenerating(true);
    appState.setBatchProgress({
      total: imagesToProcess.length,
      completed: 0,
      progress: 0,
    });

    try {
      const results = await appLogic.processBatch(
        imagesToProcess,
        appState.selectedModel(),
        (progress) => appState.setBatchProgress(progress),
      );

      const updatedImages = appLogic.updateImagesWithResults(
        appState.images(),
        results,
        appState.selectedModel(),
      );
      appState.setImages(updatedImages);

      const successCount = appLogic.getSuccessCount(results);
      notify(
        `Batch processing completed: ${successCount}/${results.length} successful`,
        "success",
      );
    } catch (error) {
      notify("Batch processing failed", "error");
      console.error("Batch processing failed:", error);
    } finally {
      appState.setIsGenerating(false);
      appState.setBatchProgress(null);
      await updateSystemStats();
    }
  };

  const saveCaption = () => {
    const currentWorkflow = workflow.workflow();
    if (!currentWorkflow) return;

    const updatedImages = appLogic.updateImageCaption(
      appState.images(),
      currentWorkflow.image.id,
      currentWorkflow.editedCaption,
      currentWorkflow.tags,
    );
    appState.setImages(updatedImages);

    notify("Caption saved successfully!", "success");
    appState.setIsModalOpen(false);
    workflow.clearWorkflow();
  };

  const deleteImage = (imageId: string) => {
    const updatedImages = appLogic.deleteImage(appState.images(), imageId);
    appState.setImages(updatedImages);
    if (appState.selectedImage()?.id === imageId) {
      appState.setSelectedImage(null);
    }
    notify("Image deleted", "info");
  };

  return {
    handleFileUpload,
    generateCaption,
    batchGenerateCaptions,
    saveCaption,
    deleteImage,
    updateSystemStats,
  };
}
