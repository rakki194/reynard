/**
 * Bar Chart Configuration Utilities
 * Handles chart options and configuration for bar charts
 */

import { ChartConfig, ReynardTheme } from "../types";
import { getDefaultConfig } from "./index";

export interface BarChartConfigOptions {
  title?: string;
  showGrid: boolean;
  showLegend: boolean;
  responsive: boolean;
  maintainAspectRatio: boolean;
  horizontal: boolean;
  stacked: boolean;
  xAxis?: ChartConfig["xAxis"];
  yAxis?: ChartConfig["yAxis"];
  animation?: ChartConfig["animation"];
  tooltip?: ChartConfig["tooltip"];
  theme?: ReynardTheme;
}

export const createBarChartOptions = (options: BarChartConfigOptions) => {
  const baseConfig = getDefaultConfig("bar");

  // Determine which axis is categorical vs numeric based on orientation
  const categoryAxis = options.horizontal ? "y" : "x";
  const valueAxis = options.horizontal ? "x" : "y";

  return {
    ...baseConfig,
    indexAxis: (options.horizontal ? "y" : "x") as "x" | "y",
    responsive: options.responsive,
    maintainAspectRatio: options.maintainAspectRatio,
    animation: options.animation || (baseConfig as any).animation,
    plugins: {
      ...baseConfig.plugins,
      title: {
        display: !!options.title,
        text: options.title,
        color: "var(--text-primary)",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      legend: {
        ...baseConfig.plugins?.legend,
        display: options.showLegend,
      },
      tooltip: {
        ...baseConfig.plugins?.tooltip,
        ...options.tooltip,
      },
    },
    scales: {
      [categoryAxis]: {
        type: "category",
        display: categoryAxis === "x" ? options.xAxis?.display !== false : options.yAxis?.display !== false,
        title: {
          display: categoryAxis === "x" ? !!options.xAxis?.label : !!options.yAxis?.label,
          text: categoryAxis === "x" ? options.xAxis?.label : options.yAxis?.label,
          color: "var(--text-primary)",
        },
        grid: {
          display: false, // Usually hide grid for category axis
        },
        ticks: {
          color: "var(--text-secondary)",
          ...(categoryAxis === "x" ? options.xAxis?.ticks : options.yAxis?.ticks),
        },
        stacked: options.stacked,
      },
      [valueAxis]: {
        type: "linear",
        display: valueAxis === "x" ? options.xAxis?.display !== false : options.yAxis?.display !== false,
        position: valueAxis === "y" ? options.yAxis?.position || "left" : options.xAxis?.position || "bottom",
        title: {
          display: valueAxis === "x" ? !!options.xAxis?.label : !!options.yAxis?.label,
          text: valueAxis === "x" ? options.xAxis?.label : options.yAxis?.label,
          color: "var(--text-primary)",
        },
        grid: {
          display: options.showGrid,
          color: "var(--border-color)",
          lineWidth: 1,
        },
        ticks: {
          color: "var(--text-secondary)",
          ...(valueAxis === "x" ? options.xAxis?.ticks : options.yAxis?.ticks),
        },
        beginAtZero: true,
        stacked: options.stacked,
        min: valueAxis === "x" ? options.xAxis?.min : options.yAxis?.min,
        max: valueAxis === "x" ? options.xAxis?.max : options.yAxis?.max,
      },
    },
  };
};
