/**
 * ModelSelector Component
 * Allows users to select and configure AI models for caption generation
 */

import { Component, createSignal, createResource, For } from "solid-js";
import { Button, Card, Select } from "reynard-components";
import { useNotifications } from "reynard-core";
import { AnnotationManager } from "reynard-annotating";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  annotationManager: AnnotationManager;
}

interface ModelInfo {
  name: string;
  description: string;
  captionType: string;
  isAvailable: boolean;
  isLoaded: boolean;
}

export const ModelSelector: Component<ModelSelectorProps> = props => {
  const { notify } = useNotifications();
  const [availableModels, setAvailableModels] = createSignal<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);

  // Load available models
  const loadModels = async () => {
    setIsLoading(true);
    try {
      const generators = props.annotationManager.getAvailableGenerators();
      const models: ModelInfo[] = generators.map(gen => ({
        name: gen.name,
        description: gen.description,
        captionType: gen.captionType,
        isAvailable: gen.isAvailable,
        isLoaded: gen.isLoaded,
      }));
      setAvailableModels(models);
    } catch (error) {
      notify("Failed to load models", "error");
      console.error("Model loading failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preload selected model
  const preloadModel = async (modelName: string) => {
    try {
      await props.annotationManager.preloadModel(modelName);
      notify(`Model ${modelName} preloaded successfully`, "success");
      loadModels(); // Refresh model status
    } catch (error) {
      notify(`Failed to preload model ${modelName}`, "error");
      console.error("Model preloading failed:", error);
    }
  };

  // Unload model
  const unloadModel = async (modelName: string) => {
    try {
      await props.annotationManager.unloadModel(modelName);
      notify(`Model ${modelName} unloaded`, "info");
      loadModels(); // Refresh model status
    } catch (error) {
      notify(`Failed to unload model ${modelName}`, "error");
      console.error("Model unloading failed:", error);
    }
  };

  // Load models on mount
  createResource(() => loadModels());

  return (
    <div class="model-selector">
      <Card class="model-selection" padding="lg">
        <h3>AI Model Selection</h3>
        <p>Choose the AI model for caption generation. Different models have different strengths and capabilities.</p>

        <div class="model-controls">
          <div class="model-dropdown">
            <label for="model-select">Select Model:</label>
            <select
              id="model-select"
              value={props.selectedModel}
              onChange={e => props.onModelChange(e.currentTarget.value)}
            >
              <For each={availableModels()}>
                {model => (
                  <option value={model.name} disabled={!model.isAvailable}>
                    {model.name} {!model.isAvailable ? "(Not Available)" : ""}
                  </option>
                )}
              </For>
            </select>
          </div>

          <div class="model-actions">
            <Button variant="primary" onClick={() => preloadModel(props.selectedModel)} disabled={isLoading()}>
              {isLoading() ? "Loading..." : "Preload Model"}
            </Button>
            <Button variant="secondary" onClick={() => unloadModel(props.selectedModel)}>
              Unload Model
            </Button>
          </div>
        </div>
      </Card>

      <Card class="model-info" padding="lg">
        <h3>Available Models</h3>
        <div class="models-list">
          <For each={availableModels()}>
            {model => (
              <div class={`model-item ${model.name === props.selectedModel ? "selected" : ""}`}>
                <div class="model-header">
                  <h4>{model.name}</h4>
                  <div class="model-status">
                    <span class={`status-badge ${model.isAvailable ? "available" : "unavailable"}`}>
                      {model.isAvailable ? "Available" : "Unavailable"}
                    </span>
                    <span class={`status-badge ${model.isLoaded ? "loaded" : "unloaded"}`}>
                      {model.isLoaded ? "Loaded" : "Unloaded"}
                    </span>
                  </div>
                </div>
                <p class="model-description">{model.description}</p>
                <div class="model-meta">
                  <span class="caption-type">Type: {model.captionType}</span>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>

      <Card class="model-tips" padding="lg">
        <h3>Model Tips</h3>
        <ul>
          <li>
            <strong>Florence2:</strong> Best for general image descriptions and detailed captions
          </li>
          <li>
            <strong>JTP2:</strong> Good for artistic and creative content
          </li>
          <li>
            <strong>JoyCaption:</strong> Optimized for joyful and positive content
          </li>
          <li>
            <strong>WDv3:</strong> Excellent for technical and detailed descriptions
          </li>
        </ul>
        <p>
          Preloading models improves generation speed but uses more memory. Unload models you're not using to free up
          resources.
        </p>
      </Card>
    </div>
  );
};
