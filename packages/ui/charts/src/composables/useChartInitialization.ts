/**
 * Chart Initialization Composable
 * Handles chart setup and lifecycle management
 */

import { onMount, onCleanup } from "solid-js";
import { registerChartComponents } from "../utils/chartConfig";

export interface ChartInitializationConfig {
  enablePerformanceMonitoring?: boolean;
  visualization: {
    registerVisualization: () => void;
    unregisterVisualization: () => void;
  };
  onInitialize: () => void;
}

export function useChartInitialization(config: ChartInitializationConfig) {
  onMount(() => {
    // Register Chart.js components
    registerChartComponents();

    // Register this visualization
    if (config.enablePerformanceMonitoring) {
      config.visualization.registerVisualization();
    }

    config.onInitialize();
  });

  onCleanup(() => {
    if (config.enablePerformanceMonitoring) {
      config.visualization.unregisterVisualization();
    }
  });
}
