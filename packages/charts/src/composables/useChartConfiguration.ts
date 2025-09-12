/**
 * Chart Configuration Composable
 * Handles chart configuration setup and management
 */

import { ChartType, Dataset } from "../types";

export interface ChartConfigurationConfig {
  type: ChartType;
  labels: string[];
  datasets: Dataset[];
  useOKLCH?: boolean;
  colorTheme?: string;
  colorGenerator?: (theme: string, label: string) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  realTime?: boolean;
  updateInterval?: number;
  enablePerformanceMonitoring?: boolean;
  title?: string;
  visualization: {
    generateColors: (count: number, alpha?: number) => string[];
    registerVisualization: () => void;
    unregisterVisualization: () => void;
    stats: () => any;
  };
}

export function useChartConfiguration(config: ChartConfigurationConfig) {
  return {
    visualization: config.visualization,
    chartStateConfig: {
      type: config.type,
      labels: config.labels,
      datasets: config.datasets,
      realTime: config.realTime,
      updateInterval: config.updateInterval,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring,
    },
    chartDataConfig: {
      type: config.type,
      labels: config.labels,
      datasets: config.datasets,
      useOKLCH: config.useOKLCH!,
      colorTheme: config.colorTheme!,
      colorGenerator: config.colorGenerator,
      showLegend: config.showLegend,
      showGrid: config.showGrid,
      xAxisLabel: config.xAxisLabel,
      yAxisLabel: config.yAxisLabel,
      title: config.title,
      visualization: config.visualization,
    },
    initializationConfig: {
      enablePerformanceMonitoring: config.enablePerformanceMonitoring,
      visualization: config.visualization,
    },
  };
}
