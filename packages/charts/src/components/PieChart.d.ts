/**
 * Pie Chart Component
 * A responsive pie/doughnut chart for proportional data
 */
import { Component } from "solid-js";
import { ChartConfig, ReynardTheme } from "../types";
export interface PieChartProps extends ChartConfig {
  /** Chart labels */
  labels: string[];
  /** Chart data values */
  data: number[];
  /** Chart variant */
  variant?: "pie" | "doughnut";
  /** Doughnut cutout percentage (0-1) */
  cutout?: number;
  /** Custom colors */
  colors?: string[];
  /** Whether to show data values on hover */
  showValues?: boolean;
  /** Custom class name */
  class?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Theme for the chart */
  theme?: ReynardTheme;
}
export declare const PieChart: Component<PieChartProps>;
