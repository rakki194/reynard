/**
 * Chart Component
 * Professional unified chart component with OKLCH color integration and real-time capabilities
 */

import {
  Component,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";
import { Line, Bar, Doughnut, Pie } from "solid-chartjs";
import {
  Chart as ChartJS,
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
  registerables,
} from "chart.js";
import {
  VisualizationEngine,
  useVisualizationEngine,
} from "../core/VisualizationEngine";
import { ChartConfig, Dataset, ChartType, ReynardTheme } from "../types";

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

const defaultProps = {
  width: 400,
  height: 300,
  showGrid: true,
  showLegend: true,
  useOKLCH: true,
  colorTheme: "dark",
  realTime: false,
  updateInterval: 1000,
  loading: false,
  emptyMessage: "No data available",
  enablePerformanceMonitoring: true,
};

export const Chart: Component<ChartProps> = (props) => {
  const [local, others] = splitProps(props, [
    "type",
    "labels",
    "datasets",
    "useOKLCH",
    "colorTheme",
    "realTime",
    "updateInterval",
    "colorGenerator",
    "loading",
    "emptyMessage",
    "enablePerformanceMonitoring",
    "showLegend",
    "showGrid",
    "xAxisLabel",
    "yAxisLabel",
  ]);

  const [isRegistered, setIsRegistered] = createSignal(false);
  const [chartData, setChartData] = createSignal<any>(null);
  const [chartOptions, setChartOptions] = createSignal<any>(null);
  const [updateInterval, setUpdateInterval] =
    createSignal<NodeJS.Timeout | null>(null);
  const [chartInstance, setChartInstance] = createSignal<any>(null);

  // Initialize visualization engine
  const visualization = useVisualizationEngine({
    theme: local.colorTheme as any,
    useOKLCH: local.useOKLCH,
  });

  onMount(() => {
    // Register Chart.js components
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
      ...registerables,
    );
    setIsRegistered(true);

    // Register this visualization
    if (local.enablePerformanceMonitoring) {
      visualization.registerVisualization();
    }

    updateChart();
  });

  onCleanup(() => {
    if (updateInterval()) {
      clearInterval(updateInterval()!);
    }

    if (local.enablePerformanceMonitoring) {
      visualization.unregisterVisualization();
    }
  });

  // Update chart when props change
  createEffect(() => {
    updateChart();
  });

  // Real-time updates
  createEffect(() => {
    if (local.realTime && local.updateInterval) {
      if (updateInterval()) {
        clearInterval(updateInterval()!);
      }

      const interval = setInterval(() => {
        updateChart();
      }, local.updateInterval);

      setUpdateInterval(interval);
    } else if (updateInterval()) {
      clearInterval(updateInterval()!);
      setUpdateInterval(null);
    }
  });

  const updateChart = () => {
    if (!local.datasets || local.datasets.length === 0) {
      setChartData(null);
      return;
    }

    const chart = chartInstance();

    // If chart instance exists and this is a real-time update, update data directly
    if (chart && local.realTime) {
      updateChartDataIncremental(chart);
      return;
    }

    // Initial setup or non-real-time updates
    setupChartData();
  };

  const setupChartData = () => {
    // Prepare datasets with enhanced color generation
    const enhancedDatasets = local.datasets.map((dataset, index) => {
      let backgroundColor: string;
      let borderColor: string;

      if (local.colorGenerator) {
        // Use custom color generator
        const color = local.colorGenerator(local.colorTheme!, dataset.label);
        backgroundColor = color;
        borderColor = color;
      } else if (local.useOKLCH) {
        // Use OKLCH color generation from visualization engine
        const colors = visualization.generateColors(local.datasets.length);
        backgroundColor =
          colors[index]?.replace("1)", "0.6)") || `rgba(54, 162, 235, 0.6)`;
        borderColor = colors[index] || "rgba(54, 162, 235, 1)";
      } else {
        // Use default colors
        const defaultColors = [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ];
        backgroundColor =
          defaultColors[index]?.replace("1)", "0.6)") ||
          `rgba(54, 162, 235, 0.6)`;
        borderColor = defaultColors[index] || "rgba(54, 162, 235, 1)";
      }

      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || backgroundColor,
        borderColor: dataset.borderColor || borderColor,
        borderWidth: dataset.borderWidth || 2,
        pointBackgroundColor: dataset.pointBackgroundColor || borderColor,
        pointBorderColor: dataset.pointBorderColor || "#fff",
        pointBorderWidth: dataset.pointBorderWidth || 1,
        pointRadius: dataset.pointRadius || 4,
        pointHoverRadius: dataset.pointHoverRadius || 6,
        tension: dataset.tension || 0.1,
        fill: dataset.fill || false,
      };
    });

    const data = {
      labels: local.labels,
      datasets: enhancedDatasets,
    };

    setChartData(data);

    // Generate chart options
    const options = getDefaultChartOptions(local.type, {
      text: local.useOKLCH ? visualization.generateColors(1)[0] : "#ffffff",
      background: local.useOKLCH
        ? visualization.generateColors(1, 0.8)[0]
        : "rgba(0, 0, 0, 0.8)",
      grid: local.useOKLCH
        ? visualization.generateColors(1, 0.3)[0]
        : "rgba(255, 255, 255, 0.1)",
    });

    // Apply additional options from props
    const enhancedOptions = {
      ...options,
      animation: {
        duration: 0, // Disable animations for real-time updates
      },
      plugins: {
        ...options.plugins,
        title: {
          display: !!others.title,
          text: others.title || "",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        legend: {
          ...options.plugins.legend,
          display: local.showLegend !== false,
        },
      },
      scales:
        local.type === "doughnut" || local.type === "pie"
          ? undefined
          : {
              ...options.scales,
              x: {
                ...options.scales?.x,
                title: {
                  display: !!local.xAxisLabel,
                  text: local.xAxisLabel || "",
                },
                grid: {
                  ...options.scales?.x?.grid,
                  display: local.showGrid !== false,
                },
              },
              y: {
                ...options.scales?.y,
                title: {
                  display: !!local.yAxisLabel,
                  text: local.yAxisLabel || "",
                },
                grid: {
                  ...options.scales?.y?.grid,
                  display: local.showGrid !== false,
                },
              },
            },
    };

    setChartOptions(enhancedOptions);
  };

  const updateChartDataIncremental = (chart: any) => {
    // Update labels directly
    if (local.labels && local.labels.length > 0) {
      chart.data.labels = [...local.labels];
    }

    // Update datasets directly
    if (local.datasets && local.datasets.length > 0) {
      local.datasets.forEach((dataset, datasetIndex) => {
        if (chart.data.datasets[datasetIndex]) {
          // Update data array directly
          chart.data.datasets[datasetIndex].data = [...dataset.data];

          // Update other properties if they changed
          if (dataset.label) {
            chart.data.datasets[datasetIndex].label = dataset.label;
          }
        }
      });
    }

    // Update chart without animations to prevent reset-to-zero effect
    chart.update("none");
  };

  const renderChart = () => {
    if (!chartData() || !chartOptions()) return null;

    const commonProps = {
      data: chartData(),
      options: chartOptions(),
      width: others.width || 400,
      height: others.height || 300,
      ref: (chart: any) => {
        if (chart && local.realTime) {
          setChartInstance(chart);
        }
      },
    };

    switch (local.type) {
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
      <Show when={local.loading}>
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
          !local.loading && (!chartData() || chartData().datasets.length === 0)
        }
      >
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

      <Show when={isRegistered() && chartData() && !local.loading}>
        {renderChart()}
      </Show>

      {/* Performance monitoring overlay */}
      <Show
        when={
          local.enablePerformanceMonitoring &&
          visualization.stats().activeVisualizations > 0
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
          FPS: {visualization.stats().fps} | Memory:{" "}
          {visualization.stats().memoryUsage.toFixed(1)}MB
        </div>
      </Show>
    </div>
  );
};

/**
 * Get default chart options for a given type
 */
function getDefaultChartOptions(
  type: ChartType,
  theme: { text: string; background: string; grid: string },
): any {
  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: theme.text,
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme.background,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.grid,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
      },
    },
  };

  // Type-specific configurations
  switch (type) {
    case "line":
      return {
        ...baseConfig,
        elements: {
          line: {
            tension: 0.4,
          },
          point: {
            radius: 4,
            hoverRadius: 6,
          },
        },
        scales: {
          x: {
            grid: {
              color: theme.grid,
              display: true,
            },
            ticks: {
              color: theme.text,
            },
          },
          y: {
            grid: {
              color: theme.grid,
              display: true,
            },
            ticks: {
              color: theme.text,
            },
          },
        },
      };

    case "bar":
      return {
        ...baseConfig,
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: theme.text,
            },
          },
          y: {
            grid: {
              color: theme.grid,
              display: true,
            },
            ticks: {
              color: theme.text,
            },
            beginAtZero: true,
          },
        },
      };

    case "doughnut":
    case "pie":
      return {
        ...baseConfig,
        plugins: {
          ...baseConfig.plugins,
          legend: {
            ...baseConfig.plugins.legend,
            position: "right" as const,
          },
        },
      };

    default:
      return baseConfig;
  }
}
