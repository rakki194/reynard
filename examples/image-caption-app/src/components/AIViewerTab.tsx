/**
 * AI Viewer Tab Component
 *
 * Handles the AI Image Viewer tab functionality.
 */

import { Component, Show } from "solid-js";
import { AIImageViewer, type FileItem } from "reynard-gallery-ai";
import { useNotifications } from "reynard-core";
import type { UseAppStateReturn } from "../composables/useAppState";
import type { ImageItem } from "../types";

interface AIViewerTabProps {
  appState: UseAppStateReturn;
}

// Convert ImageItem to FileItem for AI Gallery
const convertToFileItem = (image: ImageItem): FileItem => ({
  id: image.id,
  name: image.name,
  path: image.url,
  type: "image/jpeg",
  size: 0,
  modified: new Date(),
  metadata: {
    hasCaption: !!image.caption,
    aiProcessed: !!image.generatedAt,
    caption: image.caption,
    tags: image.tags || [],
    model: image.model,
    generatedAt: image.generatedAt,
  },
});

export const AIViewerTab: Component<AIViewerTabProps> = props => {
  const { notify } = useNotifications();

  return (
    <div class="ai-viewer-section">
      <Show when={props.appState.selectedImage()}>
        <AIImageViewer
          imageInfo={convertToFileItem(props.appState.selectedImage()!)}
          aiProps={{
            showGenerationControls: true,
            availableGenerators: ["jtp2", "wdv3", "joy", "florence2"],
            autoGenerateOnOpen: false,
          }}
          onCaptionSave={async (_caption: string) => {
            notify("Caption saved successfully", "success");
          }}
        />
      </Show>
      <Show when={!props.appState.selectedImage()}>
        <div class="no-selection">
          <h3>No Image Selected</h3>
          <p>Select an image from the AI Gallery to view it here.</p>
        </div>
      </Show>
    </div>
  );
};
