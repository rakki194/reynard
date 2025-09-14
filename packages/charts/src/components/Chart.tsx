/**
 * Chart Component
 * Professional unified chart component with OKLCH color integration and real-time capabilities
 */

import { Component, createEffect, splitProps } from "solid-js";
import { useVisualizationEngine } from "../core/VisualizationEngine";
import { ChartConfig, ChartType, Dataset } from "../types";
import { ChartRenderer } from "./ChartRenderer";
import { chartPropsToSplit } from "../utils/chartConfig";
import { useChartState } from "../composables/useChartState";
import { useChartData } from "../composables/useChartData";
import { useChartInitialization } from "../composables/useChartInitialization";
import { useChartConfiguration } from "../composables/useChartConfiguration";
import { useChartRendering } from "../composables/useChartRendering";

export interface ChartProps extends ChartConfig {
  /** Chart type */
  type: ChartType;
  /** Chart labels */
  labels: string[];
  /** Chart datasets */
  datasets: Dataset[];
  /** Whether to use OKLCH colors */
  useOKLCH?: boolean;
  /** Theme for color generation */
  colorTheme?: string;
  /** Real-time data updates */
  realTime?: boolean;
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** Custom color generator function */
  colorGenerator?: (theme: string, label: string) => string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Performance monitoring */
  enablePerformanceMonitoring?: boolean;
}

export const Chart: Component<ChartProps> = (props) => {
  console.log("🦊 Chart: Component initialized with props", props);
  
  const [local, others] = splitProps(props, chartPropsToSplit);

  console.log("🦊 Chart: Split props", { local, others });

  // Initialize visualization engine
  const visualization = useVisualizationEngine({
    theme: local.colorTheme as any,
    useOKLCH: local.useOKLCH,
  });

  // Get chart configuration
  const config = useChartConfiguration({
    type: local.type,
    labels: local.labels,
    datasets: local.datasets,
    useOKLCH: local.useOKLCH,
    colorTheme: local.colorTheme,
    colorGenerator: local.colorGenerator,
    showLegend: local.showLegend,
    showGrid: local.showGrid,
    xAxisLabel: local.xAxisLabel,
    yAxisLabel: local.yAxisLabel,
    realTime: local.realTime,
    updateInterval: local.updateInterval,
    enablePerformanceMonitoring: local.enablePerformanceMonitoring,
    title: others.title,
    visualization,
  });

  // Initialize chart state
  const chartState = useChartState(config.chartStateConfig);

  // Initialize chart data processing
  const chartData = useChartData(config.chartDataConfig);

  const updateChart = () => {
    console.log("🦊 Chart: updateChart called");
    const { data, options } = chartData.setupChartData();
    console.log("🦊 Chart: Setting chart data", { data, options });
    chartState.setChartData(data);
    chartState.setChartOptions(options);
    console.log("🦊 Chart: Chart state after update", {
      chartData: chartState.chartData(),
      chartOptions: chartState.chartOptions()
    });
  };

  // Initialize chart lifecycle
  useChartInitialization({
    ...config.initializationConfig,
    onInitialize: updateChart,
  });

  // Update chart when props change
  createEffect(() => {
    updateChart();
  });

  // Get rendering props
  const renderProps = useChartRendering({
    type: local.type,
    chartData: chartState.chartData,
    chartOptions: chartState.chartOptions,
    width: others.width,
    height: others.height,
    loading: local.loading,
    emptyMessage: local.emptyMessage,
    enablePerformanceMonitoring: local.enablePerformanceMonitoring,
    performanceStats: visualization.stats,
    realTime: local.realTime,
    onChartRef: chartState.setChartInstance,
  });

  console.log("🦊 Chart: About to render ChartRenderer with props", renderProps());
  
  return <ChartRenderer {...renderProps()} />;
};
