/**
 * Chart Rendering Composable
 * Handles chart rendering logic and props
 */

import { ChartType } from "../types";
import { defaultChartProps } from "../utils/chartConfig";

export interface ChartRenderingConfig {
  type: ChartType;
  chartData: () => any;
  chartOptions: () => any;
  width?: number;
  height?: number;
  loading?: boolean;
  emptyMessage?: string;
  enablePerformanceMonitoring?: boolean;
  performanceStats: () => any;
  realTime?: boolean;
  onChartRef: (chart: any) => void;
}

export function useChartRendering(config: ChartRenderingConfig) {
  return {
    type: config.type,
    data: config.chartData(),
    options: config.chartOptions(),
    width: config.width || defaultChartProps.width,
    height: config.height || defaultChartProps.height,
    loading: config.loading,
    emptyMessage: config.emptyMessage,
    enablePerformanceMonitoring: config.enablePerformanceMonitoring,
    performanceStats: config.performanceStats(),
    onChartRef: (chart: any) => {
      if (chart && config.realTime) {
        config.onChartRef(chart);
      }
    },
  };
}
