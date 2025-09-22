/**
 * Direct Chart.js Integration Utilities
 * Provides a clean interface for integrating Chart.js directly with SolidJS
 */

import {
  ArcElement,
  BarElement,
  CategoryScale,
  ChartConfiguration,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  TimeSeriesScale,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { createEffect, createSignal, onCleanup } from "solid-js";

// Ensure Chart.js is properly loaded
if (typeof window !== "undefined") {
  console.log("🦊 chartIntegration: ChartJS import check", {
    ChartJS: !!ChartJS,
    version: ChartJS?.version,
    register: typeof ChartJS?.register,
  });
}

// Register Chart.js components
console.log("🦊 chartIntegration: ChartJS available?", !!ChartJS);
console.log("🦊 chartIntegration: ChartJS version", ChartJS?.version);

if (ChartJS && ChartJS.register) {
  try {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      ArcElement,
      Title,
      Tooltip,
      Legend,
      Filler,
      TimeScale,
      TimeSeriesScale
    );
    console.log("🦊 chartIntegration: Chart.js components registered successfully");
  } catch (error) {
    console.error("🦊 chartIntegration: Error registering Chart.js components", error);
  }
} else {
  console.error("🦊 chartIntegration: ChartJS or register function not available");
}

export interface ChartIntegrationConfig {
  /** Chart type */
  type: "line" | "bar" | "pie" | "doughnut" | "scatter" | "bubble" | "radar" | "polarArea";
  /** Chart data */
  data: ChartData;
  /** Chart options */
  options?: ChartOptions;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Whether to destroy chart on cleanup */
  destroyOnCleanup?: boolean;
}

export interface ChartIntegrationResult {
  /** Chart instance */
  chart: () => ChartJS | null;
  /** Canvas ref */
  canvasRef: (el: HTMLCanvasElement) => void;
  /** Update chart data */
  updateData: (data: ChartData) => void;
  /** Update chart options */
  updateOptions: (options: ChartOptions) => void;
  /** Destroy chart */
  destroy: () => void;
}

/**
 * Create a direct Chart.js integration with SolidJS
 */
export function createChartIntegration(config: ChartIntegrationConfig): ChartIntegrationResult {
  const [chart, setChart] = createSignal<ChartJS | null>(null);
  let canvasElement: HTMLCanvasElement | null = null;
  let chartCreated = false;

  const canvasRef = (el: HTMLCanvasElement) => {
    console.log("🦊 createChartIntegration: canvasRef called with element", el);
    canvasElement = el;
    if (el) {
      // Canvas is now available, try to create the chart
      createChart();
    }
  };

  const createChart = () => {
    console.log("🦊 createChartIntegration: createChart called", {
      canvasElement: !!canvasElement,
      window: typeof window !== "undefined",
      chartCreated,
    });

    if (chartCreated) {
      console.log("🦊 createChartIntegration: Chart already created, skipping");
      return;
    }

    if (!canvasElement) {
      console.log("🦊 createChartIntegration: No canvas element");
      return;
    }

    // Only create chart on client side
    if (typeof window === "undefined" || !ChartJS) {
      console.log("🦊 createChartIntegration: Not in browser environment or ChartJS not available");
      return;
    }

    const ctx = canvasElement.getContext("2d");
    if (!ctx) {
      console.log("🦊 createChartIntegration: No 2D context");
      return;
    }

    console.log("🦊 createChartIntegration: Canvas context obtained", ctx);

           const chartConfig: ChartConfiguration = {
             type: config.type as any,
             data: config.data,
             options: {
               responsive: true,
               maintainAspectRatio: false,
               ...config.options,
             },
           };

    console.log("🦊 createChartIntegration: Chart config", chartConfig);

    try {
      console.log("🦊 createChartIntegration: About to create ChartJS instance");
      const chartInstance = new ChartJS(ctx, chartConfig);
      console.log("🦊 createChartIntegration: Chart instance created successfully", chartInstance);
      setChart(chartInstance);
      chartCreated = true;
      console.log("🦊 createChartIntegration: Chart creation completed");
    } catch (error) {
      console.error("🦊 createChartIntegration: Error creating chart", error);
      console.error("🦊 createChartIntegration: Error details:", {
        message: (error as any).message,
        stack: (error as any).stack,
        config: chartConfig,
        canvasElement: canvasElement,
        ctx: ctx,
      });
    }
  };

  const updateData = (data: ChartData) => {
    const chartInstance = chart();
    if (chartInstance) {
      chartInstance.data = data;
      chartInstance.update();
    }
  };

  const updateOptions = (options: ChartOptions) => {
    const chartInstance = chart();
    if (chartInstance) {
      chartInstance.options = { ...chartInstance.options, ...options };
      chartInstance.update();
    }
  };

  const destroy = () => {
    const chartInstance = chart();
    if (chartInstance) {
      chartInstance.destroy();
      setChart(null);
    }
  };

  // Chart creation is now handled in canvasRef when canvas is available

  onCleanup(() => {
    if (config.destroyOnCleanup !== false) {
      destroy();
    }
  });

  // Update chart when config changes
  createEffect(() => {
    const chartInstance = chart();
    if (chartInstance && canvasElement) {
      updateData(config.data);
      if (config.options) {
        updateOptions(config.options);
      }
    }
  });

  return {
    chart,
    canvasRef,
    updateData,
    updateOptions,
    destroy,
  };
}

/**
 * Create a responsive chart container
 */
export function createResponsiveChart(
  config: ChartIntegrationConfig,
  containerClass: string = "reynard-chart-container"
) {
  const integration = createChartIntegration(config);

  return {
    ...integration,
    containerClass,
  };
}

/**
 * Default chart options for different chart types
 */
export const getDefaultChartOptions = (type: string): ChartOptions => {
  const baseOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
      },
    },
  };

  switch (type) {
    case "line":
      return {
        ...baseOptions,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "X Axis",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Y Axis",
            },
            beginAtZero: true,
          },
        },
      };

    case "bar":
      return {
        ...baseOptions,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Category",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Value",
            },
            beginAtZero: true,
          },
        },
      };

    case "pie":
    case "doughnut":
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins?.legend,
            position: "right" as const,
          },
        },
      };

    default:
      return baseOptions;
  }
};
