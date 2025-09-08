/**
 * Embedding 3D Visualization
 * High-dimensional embedding visualization with similarity-based color mapping
 */

import { Component, createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { EmbeddingVisualizationManager } from "./modules";

interface EmbeddingVisualizationProps {
  width?: number;
  height?: number;
  theme: string;
  embeddingCount?: number;
}

export const EmbeddingVisualization: Component<EmbeddingVisualizationProps> = (props) => {
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const [isInitialized, setIsInitialized] = createSignal(false);
  
  let visualizationManager: EmbeddingVisualizationManager | null = null;

  const initializeThreeJS = async () => {
    if (!container() || isInitialized()) return;

    try {
      visualizationManager = new EmbeddingVisualizationManager({
        width: props.width || 400,
        height: props.height || 300,
        theme: props.theme,
        embeddingCount: props.embeddingCount || 800,
        container: container()!
      });

      await visualizationManager.initialize();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Three.js:', error);
    }
  };

  createEffect(() => {
    if (isInitialized() && visualizationManager) {
      visualizationManager.updateTheme(props.theme);
    }
  });

  onMount(() => {
    initializeThreeJS();
  });

  onCleanup(() => {
    if (visualizationManager) {
      visualizationManager.dispose();
    }
  });

  return (
    <div 
      ref={setContainer}
      class="simple-threed-container"
    />
  );
};