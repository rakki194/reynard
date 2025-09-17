/**
 * Chart State Composable
 * Manages chart state and real-time updates
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { ChartType, Dataset } from "../types";
import { updateChartDataIncremental } from "../utils/chartDataProcessor";

export interface ChartStateConfig {
  type: ChartType;
  labels: string[];
  datasets: Dataset[];
  realTime?: boolean;
  updateInterval?: number;
  enablePerformanceMonitoring?: boolean;
}

export function useChartState(config: ChartStateConfig) {
  const [chartData, setChartData] = createSignal<any>(null);
  const [chartOptions, setChartOptions] = createSignal<any>(null);

  console.log("🦊 useChartState: Initialized with config", config);
  const [updateInterval, setUpdateInterval] = createSignal<NodeJS.Timeout | null>(null);
  const [chartInstance, setChartInstance] = createSignal<any>(null);

  const updateChart = (setupData: () => void) => {
    if (!config.datasets || config.datasets.length === 0) {
      setChartData(null);
      return;
    }

    const chart = chartInstance();

    // If chart instance exists and this is a real-time update, update data directly
    if (chart && config.realTime) {
      updateChartDataIncremental(chart, config.labels, config.datasets);
      return;
    }

    // Initial setup or non-real-time updates
    setupData();
  };

  const handleIncrementalUpdate = (chart: any) => {
    updateChartDataIncremental(chart, config.labels, config.datasets);
  };

  // Real-time updates
  createEffect(() => {
    if (config.realTime && config.updateInterval) {
      if (updateInterval()) {
        clearInterval(updateInterval()!);
      }

      const interval = setInterval(() => {
        // This will be called by the parent component
      }, config.updateInterval);

      setUpdateInterval(interval);
    } else if (updateInterval()) {
      clearInterval(updateInterval()!);
      setUpdateInterval(null);
    }
  });

  onCleanup(() => {
    if (updateInterval()) {
      clearInterval(updateInterval()!);
    }
  });

  return {
    chartData,
    setChartData: (data: any) => {
      console.log("🦊 useChartState: setChartData called with", data);
      setChartData(data);
    },
    chartOptions,
    setChartOptions: (options: any) => {
      console.log("🦊 useChartState: setChartOptions called with", options);
      setChartOptions(options);
    },
    chartInstance,
    setChartInstance,
    updateChart,
    handleIncrementalUpdate,
  };
}
