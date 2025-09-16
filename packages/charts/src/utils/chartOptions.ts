/**
 * Chart Options Generator
 * Generates Chart.js configuration options for different chart types
 */

import { ChartType } from "../types";

export interface ChartTheme {
  text: string;
  background: string;
  grid: string;
}

export interface ChartOptionsConfig {
  type: ChartType;
  theme: ChartTheme;
  showLegend?: boolean;
  showGrid?: boolean;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Get default chart options for a given type
 */
export function getDefaultChartOptions(config: ChartOptionsConfig): any {
  const { type, theme, showLegend = true, showGrid = true, title, xAxisLabel, yAxisLabel } = config;

  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
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
            type: "linear" as const,
            grid: {
              color: theme.grid,
              display: showGrid,
            },
            ticks: {
              color: theme.text,
            },
            title: {
              display: !!xAxisLabel,
              text: xAxisLabel || "",
            },
          },
          y: {
            type: "linear" as const,
            grid: {
              color: theme.grid,
              display: showGrid,
            },
            ticks: {
              color: theme.text,
            },
            title: {
              display: !!yAxisLabel,
              text: yAxisLabel || "",
            },
          },
        },
      };

    case "bar":
      return {
        ...baseConfig,
        scales: {
          x: {
            type: "category" as const,
            grid: {
              display: false,
            },
            ticks: {
              color: theme.text,
            },
            title: {
              display: !!xAxisLabel,
              text: xAxisLabel || "",
            },
          },
          y: {
            type: "linear" as const,
            grid: {
              color: theme.grid,
              display: showGrid,
            },
            ticks: {
              color: theme.text,
            },
            beginAtZero: true,
            title: {
              display: !!yAxisLabel,
              text: yAxisLabel || "",
            },
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

/**
 * Enhance chart options with additional configuration
 */
export function enhanceChartOptions(
  baseOptions: any,
  config: {
    title?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    type: ChartType;
  }
): any {
  const { title, showLegend, showGrid, xAxisLabel, yAxisLabel, type } = config;

  return {
    ...baseOptions,
    animation: {
      duration: 0, // Disable animations for real-time updates
    } as const,
    plugins: {
      ...baseOptions.plugins,
      title: {
        display: !!title,
        text: title || "",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      legend: {
        ...baseOptions.plugins.legend,
        display: showLegend !== false,
      },
    },
    scales:
      type === "doughnut" || type === "pie"
        ? undefined
        : {
            ...baseOptions.scales,
            x: {
              ...baseOptions.scales?.x,
              title: {
                display: !!xAxisLabel,
                text: xAxisLabel || "",
              },
              grid: {
                ...baseOptions.scales?.x?.grid,
                display: showGrid !== false,
              },
            },
            y: {
              ...baseOptions.scales?.y,
              title: {
                display: !!yAxisLabel,
                text: yAxisLabel || "",
              },
              grid: {
                ...baseOptions.scales?.y?.grid,
                display: showGrid !== false,
              },
            },
          },
  };
}
