/**
 * AI-Enhanced App Content Component
 *
 * Integrates all AI Gallery features into the image caption app,
 * providing a comprehensive AI-powered image management experience.
 */

import { Component } from "solid-js";
import { AIGalleryProvider, type AIGalleryConfig, type FileItem, type GalleryCaptionResult } from "reynard-gallery-ai";
import { useNotifications } from "reynard-core";
import { AIMainContent } from "./AIMainContent";
import type { UseAppStateReturn } from "../composables/useAppState";
import type { UseWorkflowReturn } from "../composables/useWorkflow";
import type { UseAppHandlersReturn } from "../composables/useAppHandlers";

interface AIAppContentProps {
  appState: UseAppStateReturn;
  workflow: UseWorkflowReturn;
  handlers: UseAppHandlersReturn;
}

// AI Gallery configuration
const createAIConfig = (selectedModel: string): AIGalleryConfig => ({
  defaultGenerator: selectedModel,
  autoGenerateOnUpload: false,
  batchSettings: {
    maxConcurrent: 3,
    retryFailed: true,
    maxRetries: 2,
    progressInterval: 1000,
  },
  captionSettings: {
    defaultCaptionType: "description",
    postProcessing: true,
    forceRegeneration: false,
    generatorConfigs: {
      jtp2: { threshold: 0.2 },
      wdv3: { threshold: 0.3 },
      joy: { maxLength: 200 },
      florence2: { task: "caption" },
    },
  },
  uiPreferences: {
    showAIIndicators: true,
    showProgress: true,
    autoExpandCaptionEditor: false,
    showBatchControls: true,
  },
});

// AI Gallery callbacks
const createAICallbacks = (notify: (message: string, type?: "error" | "success" | "info" | "warning") => void) => ({
  onCaptionGenerationStart: (item: FileItem, generator: string) => {
    console.log("Caption generation started:", item.name, "with", generator);
    notify(`Generating caption for ${item.name} using ${generator}`, "info");
  },
  onCaptionGenerationComplete: (item: FileItem, result: GalleryCaptionResult) => {
    console.log("Caption generation completed:", item.name, result);
    if (result.success) {
      notify(`Caption generated for ${item.name}`, "success");
    } else {
      notify(`Failed to generate caption for ${item.name}`, "error");
    }
  },
  onBatchProcessingStart: (items: FileItem[], generator: string) => {
    console.log("Batch processing started:", items.length, "items with", generator);
    notify(`Starting batch processing of ${items.length} images`, "info");
  },
  onBatchProcessingComplete: (results: GalleryCaptionResult[]) => {
    console.log("Batch processing completed:", results.length, "results");
    const successCount = results.filter(r => r.success).length;
    notify(`Batch processing completed: ${successCount}/${results.length} successful`, "success");
  },
  onBatchProcessingError: (error: string) => {
    console.error("Batch processing error:", error);
    notify(`Batch processing failed: ${error}`, "error");
  },
});

export const AIAppContent: Component<AIAppContentProps> = props => {
  const { notify } = useNotifications();

  return (
    <AIGalleryProvider
      initialConfig={createAIConfig(props.appState.selectedModel())}
      callbacks={createAICallbacks(notify)}
      persistState={true}
      storageKey="image-caption-app-ai"
    >
      <AIMainContent appState={props.appState} workflow={props.workflow} handlers={props.handlers} />
    </AIGalleryProvider>
  );
};
