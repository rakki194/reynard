/**
 * Chart Component Sub-components
 * Reusable components for the chart renderer
 */

import { Component, Show } from "solid-js";
import { ChartType } from "../types";
import { t } from "../utils/i18n";

export const getTestId = (type: ChartType) => {
  switch (type) {
    case "line":
      return "line-chart-canvas";
    case "bar":
      return "bar-chart-canvas";
    case "doughnut":
      return "doughnut-chart-canvas";
    case "pie":
      return "pie-chart-canvas";
    default:
      return "chart-canvas";
  }
};

export const LoadingOverlay: Component<{ loading: boolean }> = (props) => (
  <Show when={props.loading}>
    <div class="chart-loading-overlay">
      {t("loading")}
    </div>
  </Show>
);

export const EmptyState: Component<{ 
  loading: boolean; 
  data: unknown; 
  height?: number; 
  emptyMessage?: string; 
}> = (props) => {
  const isEmpty = () => {
    if (!props.data) return true;
    const dataObj = props.data as Record<string, unknown>;
    const datasets = dataObj?.datasets as unknown[] | undefined;
    return !datasets || datasets.length === 0;
  };

  return (
    <Show when={!props.loading && isEmpty()}>
      <div class="chart-empty-state chart-empty-state-height">
        {props.emptyMessage || t("noData")}
      </div>
    </Show>
  );
};

export const PerformanceOverlay: Component<{
  enablePerformanceMonitoring?: boolean;
  performanceStats?: {
    fps: number;
    memoryUsage: number;
    activeVisualizations: number;
  };
}> = (props) => (
  <Show
    when={
      props.enablePerformanceMonitoring &&
      props.performanceStats &&
      props.performanceStats.activeVisualizations > 0
    }
  >
    <div class="chart-performance-overlay">
      {t("performance.fps")}: {props.performanceStats?.fps} | Memory:{" "}
      {props.performanceStats?.memoryUsage.toFixed(1)}MB
    </div>
  </Show>
);
