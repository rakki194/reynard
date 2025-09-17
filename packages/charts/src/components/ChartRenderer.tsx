/**
 * Chart Renderer Component
 * Handles the actual rendering of different chart types with Chart.js integration
 */

import { Component, Show, onCleanup, createEffect, createSignal } from "solid-js";
import { ChartType } from "../types";
import { createChartIntegration, ChartIntegrationConfig } from "../utils/chartIntegration";
import { getTestId, LoadingOverlay, EmptyState, PerformanceOverlay } from "./ChartComponents";
import "./ChartRenderer.css";

export interface ChartRendererProps {
  type: ChartType;
  data: unknown;
  options: unknown;
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
  onChartRef?: (chart: unknown) => void;
}

const ChartCanvas = (props: {
  type: ChartType;
  data: unknown;
  options: unknown;
  width?: number;
  height?: number;
  onChartRef?: (chart: unknown) => void;
}) => {
  const [chartIntegration, setChartIntegration] = createSignal<ReturnType<typeof createChartIntegration> | null>(null);
  const [canvasElement, setCanvasElement] = createSignal<HTMLCanvasElement | null>(null);

  // Create Chart.js integration reactively
  createEffect(() => {
    console.log("🦊 ChartRenderer: Creating chart integration", {
      type: props.type,
      data: props.data,
      options: props.options,
      width: props.width,
      height: props.height,
    });

    // Destroy existing integration if it exists
    const existingIntegration = chartIntegration();
    if (existingIntegration) {
      console.log("🦊 ChartRenderer: Destroying existing integration");
      existingIntegration.destroy();
    }

    const config: ChartIntegrationConfig = {
      type: props.type as "line" | "bar" | "pie" | "doughnut",
      data: props.data as any,
      options: props.options as any,
      width: props.width,
      height: props.height,
      destroyOnCleanup: true,
    };

    const integration = createChartIntegration(config);
    setChartIntegration(integration);

    // Call onChartRef when chart is available
    if (props.onChartRef) {
      const chart = integration.chart();
      if (chart) {
        console.log("🦊 ChartRenderer: Chart created successfully", chart);
        props.onChartRef(chart);
      }
    }
  });

  // Handle canvas ref when integration becomes available
  createEffect(() => {
    const integration = chartIntegration();
    const canvas = canvasElement();
    if (integration && canvas) {
      console.log("🦊 ChartCanvas: Integration and canvas both available, calling canvasRef");
      integration.canvasRef(canvas);
    }
  });

  onCleanup(() => {
    const integration = chartIntegration();
    if (integration) {
      console.log("🦊 ChartRenderer: Cleaning up integration on unmount");
      integration.destroy();
    }
  });

  return (
    <canvas
      ref={el => {
        console.log("🦊 ChartCanvas: Canvas ref called with element", el);
        setCanvasElement(el);
        const integration = chartIntegration();
        if (integration) {
          console.log("🦊 ChartCanvas: Calling integration.canvasRef immediately");
          integration.canvasRef(el);
        } else {
          console.log("🦊 ChartCanvas: No integration available yet, will be handled by effect");
        }
      }}
      width={props.width || 400}
      height={props.height || 300}
      data-testid={getTestId(props.type)}
    />
  );
};

export const ChartRenderer: Component<ChartRendererProps> = props => {
  return (
    <div class="reynard-chart">
      <LoadingOverlay loading={props.loading || false} />
      <EmptyState
        loading={props.loading || false}
        data={props.data}
        height={props.height}
        emptyMessage={props.emptyMessage}
      />

      <div class="reynard-chart-container">
        <ChartCanvas
          type={props.type}
          data={props.data}
          options={props.options}
          width={props.width}
          height={props.height}
          onChartRef={props.onChartRef}
        />
      </div>

      <PerformanceOverlay
        enablePerformanceMonitoring={props.enablePerformanceMonitoring}
        performanceStats={props.performanceStats}
      />
    </div>
  );
};
