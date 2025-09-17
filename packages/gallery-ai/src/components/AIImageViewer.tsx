/**
 * AI-Enhanced Image Viewer Component
 *
 * Enhanced image viewer with AI-powered caption generation and editing.
 * Integrates with the annotation system to provide seamless caption workflow.
 */

import { Component, Show, For, createSignal, onMount } from "solid-js";
import { Button } from "reynard-components";
import { useAIGalleryContext } from "../composables/useGalleryAI";
import type { AIImageViewerProps, GalleryCaptionResult } from "../types";

export const AIImageViewer: Component<AIImageViewerProps> = props => {
  const ai = useAIGalleryContext();
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [currentCaption, setCurrentCaption] = createSignal<string>("");
  const [isEditing, setIsEditing] = createSignal(false);
  const [selectedGenerator, setSelectedGenerator] = createSignal<string>("");
  const [generationResult, setGenerationResult] = createSignal<GalleryCaptionResult | null>(null);

  // Initialize with default generator
  onMount(() => {
    const defaultGen = props.aiProps?.defaultGenerator || ai.aiState().selectedGenerator;
    setSelectedGenerator(defaultGen);

    // Auto-generate if enabled
    if (props.aiProps?.autoGenerateOnOpen && props.imageInfo) {
      handleGenerateCaption(defaultGen);
    }
  });

  // Handle caption generation
  const handleGenerateCaption = async (generator: string) => {
    if (!props.imageInfo || isGenerating()) return;

    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const result = await ai.generateCaption(props.imageInfo, generator);
      setGenerationResult(result);

      if (result.success && result.caption) {
        setCurrentCaption(result.caption);
      }
    } catch (error) {
      console.error("Caption generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle caption save
  const handleSaveCaption = async () => {
    if (!currentCaption() || !props.onCaptionSave) return;

    try {
      await props.onCaptionSave({
        caption: currentCaption(),
        type: generationResult()?.captionType || "caption",
        generator: selectedGenerator(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save caption:", error);
    }
  };

  // Handle caption delete
  const handleDeleteCaption = async () => {
    if (!props.onCaptionDelete) return;

    try {
      await props.onCaptionDelete(generationResult()?.captionType || "caption");
      setCurrentCaption("");
      setGenerationResult(null);
    } catch (error) {
      console.error("Failed to delete caption:", error);
    }
  };

  // Handle caption edit
  const handleEditCaption = () => {
    setIsEditing(true);
  };

  // Handle caption cancel
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original caption if available
    if (generationResult()?.caption) {
      setCurrentCaption(generationResult()!.caption!);
    }
  };

  return (
    <div class="ai-image-viewer">
      {/* Main Image Display */}
      <div class="ai-image-viewer__image-container">
        <img
          src={props.imageInfo?.url || props.imageInfo?.path}
          alt={props.imageInfo?.name || "Image"}
          class="ai-image-viewer__image"
        />

        {/* Generation Overlay */}
        <Show when={isGenerating()}>
          <div class="ai-image-viewer__overlay">
            <div class="ai-image-viewer__spinner">
              <div class="ai-image-viewer__spinner-inner" />
            </div>
            <span class="ai-image-viewer__generating-text">Generating caption...</span>
          </div>
        </Show>
      </div>

      {/* AI Controls */}
      <Show when={props.aiProps?.showGenerationControls !== false}>
        <div class="ai-image-viewer__controls">
          <div class="ai-image-viewer__generator-selector">
            <label class="ai-image-viewer__label">Generator:</label>
            <select
              value={selectedGenerator()}
              onChange={e => setSelectedGenerator(e.currentTarget.value)}
              disabled={isGenerating()}
              class="ai-image-viewer__select"
              title="Select caption generator"
            >
              <For each={props.aiProps?.availableGenerators || ai.getAvailableGenerators()}>
                {generator => <option value={generator}>{getGeneratorDisplayName(generator)}</option>}
              </For>
            </select>
          </div>

          <div class="ai-image-viewer__actions">
            <Button
              variant="primary"
              onClick={() => handleGenerateCaption(selectedGenerator())}
              disabled={isGenerating()}
              class="ai-image-viewer__generate-btn"
            >
              <Show when={isGenerating()} fallback="Generate Caption">
                Generating...
              </Show>
            </Button>
          </div>
        </div>
      </Show>

      {/* Caption Display and Editing */}
      <Show when={props.aiProps?.enableCaptionEditing !== false}>
        <div class="ai-image-viewer__caption-section">
          <div class="ai-image-viewer__caption-header">
            <h3 class="ai-image-viewer__caption-title">Caption</h3>
            <Show when={currentCaption() && !isEditing()}>
              <div class="ai-image-viewer__caption-actions">
                <Button variant="ghost" size="sm" onClick={handleEditCaption} class="ai-image-viewer__edit-btn">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeleteCaption} class="ai-image-viewer__delete-btn">
                  Delete
                </Button>
              </div>
            </Show>
          </div>

          <Show when={isEditing()}>
            <div class="ai-image-viewer__caption-editor">
              <textarea
                value={currentCaption()}
                onInput={e => setCurrentCaption(e.currentTarget.value)}
                placeholder="Enter caption..."
                class="ai-image-viewer__caption-textarea"
                rows={4}
              />
              <div class="ai-image-viewer__editor-actions">
                <Button variant="primary" size="sm" onClick={handleSaveCaption} class="ai-image-viewer__save-btn">
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} class="ai-image-viewer__cancel-btn">
                  Cancel
                </Button>
              </div>
            </div>
          </Show>

          <Show when={!isEditing() && currentCaption()}>
            <div class="ai-image-viewer__caption-display">
              <p class="ai-image-viewer__caption-text">{currentCaption()}</p>
              <Show when={generationResult()}>
                <div class="ai-image-viewer__caption-meta">
                  <span class="ai-image-viewer__generator">
                    Generated by: {getGeneratorDisplayName(generationResult()!.generator)}
                  </span>
                  <Show when={generationResult()!.processingTime}>
                    <span class="ai-image-viewer__processing-time">({generationResult()!.processingTime}ms)</span>
                  </Show>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={!currentCaption() && !isGenerating()}>
            <div class="ai-image-viewer__no-caption">
              <p class="ai-image-viewer__no-caption-text">
                No caption available. Click "Generate Caption" to create one.
              </p>
            </div>
          </Show>
        </div>
      </Show>

      {/* Generation Result Info */}
      <Show when={generationResult()}>
        <div class="ai-image-viewer__result-info">
          <Show when={generationResult()!.success}>
            <div class="ai-image-viewer__success">✅ Caption generated successfully</div>
          </Show>
          <Show when={!generationResult()!.success}>
            <div class="ai-image-viewer__error">❌ {generationResult()!.error || "Caption generation failed"}</div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

/**
 * Get display name for a generator
 */
function getGeneratorDisplayName(generator: string): string {
  const displayNames: Record<string, string> = {
    jtp2: "JTP2 (Furry Tags)",
    wdv3: "WDv3 (Anime Tags)",
    joy: "JoyCaption (Detailed)",
    florence2: "Florence2 (General)",
  };

  return displayNames[generator] || generator;
}
