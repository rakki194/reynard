/**
 * Chart Renderer Component
 * Handles the actual rendering of different chart types
 */

import { Component, Show } from "solid-js";
import { Line, Bar, Doughnut, Pie } from "solid-chartjs";
import { ChartType } from "../types";

export interface ChartRendererProps {
  type: ChartType;
  data: any;
  options: any;
  width?: number;
  height?: number;
  loading?: boolean;
  emptyMessage?: string;
  enablePerformanceMonitoring?: boolean;
  performanceStats?: {
    fps: number;
    memoryUsage: number;
    activeVisualizations: number;
  };
  onChartRef?: (chart: any) => void;
}

export const ChartRenderer: Component<ChartRendererProps> = (props) => {
  const renderChart = () => {
    if (!props.data || !props.options) return null;

    const commonProps = {
      data: props.data,
      options: props.options,
      width: props.width || 400,
      height: props.height || 300,
      ref: (chart: any) => {
        if (chart && props.onChartRef) {
          props.onChartRef(chart);
        }
      },
    };

    switch (props.type) {
      case "line":
        return <Line {...commonProps} />;
      case "bar":
        return <Bar {...commonProps} />;
      case "doughnut":
        return <Doughnut {...commonProps} />;
      case "pie":
        return <Pie {...commonProps} />;
      default:
        return <Line {...commonProps} />;
    }
  };

  return (
    <div class="reynard-chart" style={{ position: "relative" }}>
      <Show when={props.loading}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            "z-index": "10",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px 20px",
            "border-radius": "4px",
          }}
        >
          Loading...
        </div>
      </Show>

      <Show
        when={
          !props.loading && (!props.data || props.data.datasets.length === 0)
        }
      >
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: `${props.height || 300}px`,
            color: "var(--text-muted, #666)",
            "font-style": "italic",
          }}
        >
          {props.emptyMessage}
        </div>
      </Show>

      <Show when={props.data && !props.loading}>
        {renderChart()}
      </Show>

      {/* Performance monitoring overlay */}
      <Show
        when={
          props.enablePerformanceMonitoring &&
          props.performanceStats &&
          props.performanceStats.activeVisualizations > 0
        }
      >
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "2px 6px",
            "border-radius": "3px",
            "font-size": "10px",
            "z-index": "5",
          }}
        >
          FPS: {props.performanceStats.fps} | Memory:{" "}
          {props.performanceStats.memoryUsage.toFixed(1)}MB
        </div>
      </Show>
    </div>
  );
};
