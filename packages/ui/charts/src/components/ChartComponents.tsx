/**
 * Chart Component Sub-components
 * Reusable components for the chart renderer
 */
import { Show } from "solid-js";
import { t } from "../utils/i18n";
import type { ChartType } from "../types";

export const getTestId = (type: ChartType): string => {
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
interface LoadingOverlayProps {
  loading: boolean;
}

export const LoadingOverlay = (props: LoadingOverlayProps) => (
  <Show when={props.loading}>
    <div class="chart-loading-overlay">{t("loading")}</div>
  </Show>
);

interface EmptyStateProps {
  loading: boolean;
  data: any;
  height?: number;
  emptyMessage?: string;
}

export const EmptyState = (props: EmptyStateProps) => {
  const isEmpty = () => {
    if (!props.data) return true;
    const dataObj = props.data;
    const datasets = dataObj?.datasets;
    return !datasets || datasets.length === 0;
  };
  return (
    <Show when={!props.loading && isEmpty()}>
      <div class="chart-empty-state chart-empty-state-height">{props.emptyMessage || t("noData")}</div>
    </Show>
  );
};
interface PerformanceOverlayProps {
  enablePerformanceMonitoring?: boolean;
  performanceStats?: () => {
    activeVisualizations?: number;
    fps?: number;
    memoryUsage?: number;
  };
}

export const PerformanceOverlay = (props: PerformanceOverlayProps) => {
  const stats = props.performanceStats?.();
  return (
    <Show
      when={
        props.enablePerformanceMonitoring && stats && (stats.activeVisualizations || 0) > 0
      }
    >
      <div class="chart-performance-overlay">
        {t("performance.fps")}: {stats?.fps || 0} | Memory: {(stats?.memoryUsage || 0).toFixed(1)}MB
      </div>
    </Show>
  );
};
