/**
 * Cluster 3D Visualization
 * 3D cluster visualization with convex hulls and statistical information
 */

import {
  Component,
  createSignal,
  onMount,
  onCleanup,
  createEffect,
} from "solid-js";
import { ClusterVisualizationManager } from "./modules";

interface ClusterVisualizationProps {
  width?: number;
  height?: number;
  theme: string;
  clusterCount?: number;
}

export const ClusterVisualization: Component<ClusterVisualizationProps> = (
  props,
) => {
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const [isInitialized, setIsInitialized] = createSignal(false);

  let visualizationManager: ClusterVisualizationManager | null = null;

  const initializeThreeJS = async () => {
    if (!container() || isInitialized()) return;

    try {
      visualizationManager = new ClusterVisualizationManager({
        width: props.width || 400,
        height: props.height || 300,
        theme: props.theme,
        clusterCount: props.clusterCount || 4,
        container: container()!,
      });

      await visualizationManager.initialize();
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Three.js:", error);
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

  return <div ref={setContainer} class="simple-threed-container" />;
};
