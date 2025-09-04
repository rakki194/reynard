/**
 * Bar Chart Component
 * A responsive bar chart for categorical data
 */
import { Component } from "solid-js";
import { Dataset, ChartConfig, ReynardTheme } from "../types";
export interface BarChartProps extends ChartConfig {
  /** Chart labels */
  labels: string[];
  /** Chart datasets */
  datasets: Dataset[];
  /** Whether bars are horizontal */
  horizontal?: boolean;
  /** Whether bars are stacked */
  stacked?: boolean;
  /** Custom class name */
  class?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Theme for the chart */
  theme?: ReynardTheme;
}
export declare const BarChart: Component<BarChartProps>;
