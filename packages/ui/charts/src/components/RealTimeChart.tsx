/**
 * Real-Time Chart Component
 * Advanced real-time chart with live data streaming and performance optimization
 */
import { createSignal, createEffect, onMount, onCleanup, Show, splitProps } from "solid-js";
import { Chart } from "./Chart";
import { useVisualizationEngine } from "../core/VisualizationEngine";
import type { ChartType } from "../types";

export interface RealTimeDataPoint {
  timestamp: number;
  value: number;
  label: string;
}

interface RealTimeChartProps {
  type: ChartType;
  data: RealTimeDataPoint[];
  maxDataPoints?: number;
  updateInterval?: number;
  autoScroll?: boolean;
  timeRange?: number;
  aggregationInterval?: number;
  stepped?: boolean;
  tension?: number;
  fill?: boolean;
  pointColors?: string[];
  valueFormatter?: (value: number) => string;
  class?: string;
  loading?: boolean;
  emptyMessage?: string;
  enablePerformanceMonitoring?: boolean;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  useOKLCH?: boolean;
  colorTheme?: string;
  streaming?: {
    enabled: boolean;
    url?: string;
    websocket?: WebSocket;
    parser?: (data: any) => RealTimeDataPoint;
  };
  [key: string]: any;
}

const defaultProps: Partial<RealTimeChartProps> = {
  width: 400,
  height: 300,
  showGrid: true,
  showLegend: false,
  maxDataPoints: 100,
  updateInterval: 1000,
  autoScroll: true,
  timeRange: 60000, // 1 minute
  aggregationInterval: 1000, // 1 second
  stepped: false,
  tension: 0.1,
  fill: false,
  loading: false,
  emptyMessage: "No data available",
  enablePerformanceMonitoring: true,
};

export const RealTimeChart = (props: RealTimeChartProps) => {
  const [local, others] = splitProps(props, [
    "type",
    "data",
    "maxDataPoints",
    "updateInterval",
    "autoScroll",
    "timeRange",
    "aggregationInterval",
    "stepped",
    "tension",
    "fill",
    "pointColors",
    "valueFormatter",
    "class",
    "loading",
    "emptyMessage",
    "onDataUpdate",
    "theme",
    "enablePerformanceMonitoring",
    "streaming",
  ]);
  const [processedData, setProcessedData] = createSignal<{ labels: string[]; datasets: any[] } | null>(null);
  const [updateTimer, setUpdateTimer] = createSignal<NodeJS.Timeout | null>(null);
  const [websocket, setWebsocket] = createSignal<WebSocket | null>(null);
  // Initialize visualization engine
  const visualization = useVisualizationEngine({
    theme: local.theme,
    useOKLCH: true,
  });
  onMount(() => {
    if (local.enablePerformanceMonitoring) {
      visualization.registerVisualization();
    }
    processData();
    setupRealTimeUpdates();
    setupStreaming();
  });
  onCleanup(() => {
    if (updateTimer()) {
      clearInterval(updateTimer()!);
    }
    const ws = websocket();
    if (ws) {
      ws.close();
    }
    if (local.enablePerformanceMonitoring) {
      visualization.unregisterVisualization();
    }
  });
  // Process data when it changes
  createEffect(() => {
    processData();
  });
  const processData = () => {
    if (!local.data || local.data.length === 0) {
      setProcessedData(null);
      return;
    }
    // Sort data by timestamp
    const sortedData = [...local.data].sort((a, b) => a.timestamp - b.timestamp);
    // Apply time range filter
    const now = Date.now();
    const filteredData = local.timeRange
      ? sortedData.filter(point => now - point.timestamp <= (local.timeRange || 0))
      : sortedData;
    // Limit data points for performance
    const limitedData = local.maxDataPoints ? filteredData.slice(-local.maxDataPoints) : filteredData;
    // Aggregate data if needed
    const aggregatedData = local.aggregationInterval
      ? aggregateData(limitedData, local.aggregationInterval)
      : limitedData;
    // Convert to chart format
    const labels = aggregatedData.map(point => point.label || new Date(point.timestamp).toLocaleTimeString());
    const values = aggregatedData.map(point => point.value);
    // Generate colors using visualization engine
    const colors = visualization.generateColors(1);
    const backgroundColor = colors[0]?.replace("1)", "0.6)") || "rgba(54, 162, 235, 0.6)";
    const borderColor = colors[0] || "rgba(54, 162, 235, 1)";
    const datasets = [
      {
        label: others.title || "Real-time Data",
        data: values,
        backgroundColor: local.fill ? backgroundColor : "transparent",
        borderColor: borderColor,
        borderWidth: 2,
        pointBackgroundColor: borderColor,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: local.tension || 0.1,
        fill: local.fill || false,
        stepped: local.stepped || false,
      },
    ];
    setProcessedData({ labels, datasets });
  };
  const aggregateData = (data: any[], interval: number) => {
    if (data.length === 0) return [];
    const aggregated = new Map();
    for (const point of data) {
      const intervalStart = Math.floor(point.timestamp / interval) * interval;
      const existing = aggregated.get(intervalStart) || {
        sum: 0,
        count: 0,
        timestamp: intervalStart,
      };
      aggregated.set(intervalStart, {
        sum: existing.sum + point.value,
        count: existing.count + 1,
        timestamp: intervalStart,
      });
    }
    return Array.from(aggregated.values())
      .map(({ sum, count, timestamp }) => ({
        timestamp,
        value: sum / count, // Average
        label: new Date(timestamp).toLocaleTimeString(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };
  const setupRealTimeUpdates = () => {
    if (local.updateInterval && local.updateInterval > 0) {
      const interval = setInterval(() => {
        processData();
        local.onDataUpdate?.(local.data);
      }, local.updateInterval);
      setUpdateTimer(interval);
    }
  };
  const setupStreaming = () => {
    if (local.streaming?.enabled && local.streaming.websocket) {
      const ws = local.streaming.websocket;
      setWebsocket(ws);
      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          const newPoint = local.streaming?.parser
            ? local.streaming.parser(data)
            : {
                timestamp: Date.now(),
                value: data.value || 0,
                label: data.label,
                metadata: data.metadata,
              };
          // Add new data point
          const updatedData = [...local.data, newPoint];
          local.onDataUpdate?.(updatedData);
        } catch (error) {
          console.error("Error parsing streaming data:", error);
        }
      };
      ws.onerror = error => {
        console.error("WebSocket error:", error);
      };
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setWebsocket(null);
      };
    }
  };
  return (
    <div class={`reynard-realtime-chart ${local.class || ""}`}>
      <Show when={local.loading}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: `${others.height || 300}px`,
            color: "var(--text-muted, #666)",
          }}
        >
          <div class="loading-spinner"></div>
          <span style={{ "margin-left": "10px" }}>Loading real-time data...</span>
        </div>
      </Show>

      <Show when={!local.loading && !processedData()}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: `${others.height || 300}px`,
            color: "var(--text-muted, #666)",
            "font-style": "italic",
          }}
        >
          {local.emptyMessage}
        </div>
      </Show>

      <Show when={!local.loading && processedData()}>
        <Chart
          type={local.type}
          labels={processedData()?.labels || []}
          datasets={(processedData()?.datasets as any[]) || []}
          width={others.width}
          height={others.height}
          title={others.title}
          xAxisLabel={others.xAxisLabel || "Time"}
          yAxisLabel={others.yAxisLabel || "Value"}
          showGrid={others.showGrid}
          showLegend={others.showLegend}
          useOKLCH={true}
          colorTheme={local.theme}
          enablePerformanceMonitoring={local.enablePerformanceMonitoring}
        />
      </Show>

      {/* Real-time status indicator */}
      <Show when={local.streaming?.enabled}>
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "5px",
            background: websocket() ? "rgba(0, 255, 0, 0.8)" : "rgba(255, 0, 0, 0.8)",
            color: "white",
            padding: "2px 6px",
            "border-radius": "3px",
            "font-size": "10px",
            "z-index": "5",
          }}
        >
          {websocket() ? "● LIVE" : "● OFFLINE"}
        </div>
      </Show>
    </div>
  );
};
