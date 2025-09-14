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
  console.log("🦊 useChartRendering: Called with config", config);
  
  // Make the result reactive to chart state changes
  const result = () => {
    const chartData = config.chartData();
    const chartOptions = config.chartOptions();
    
    console.log("🦊 useChartRendering: Getting current chart state", { chartData, chartOptions });
    
    return {
      type: config.type,
      data: chartData,
      options: chartOptions,
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
  };
  
  console.log("🦊 useChartRendering: Returning reactive render props function");
  
  return result;
}
