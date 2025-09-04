/**
 * Line Chart Component
 * A responsive line chart with time series support
 */
import { Component } from "solid-js";
import {
  Dataset,
  ChartConfig,
  TimeSeriesDataPoint,
  ReynardTheme,
} from "../types";
export interface LineChartProps extends ChartConfig {
  /** Chart labels */
  labels?: string[];
  /** Chart datasets */
  datasets?: Dataset[];
  /** Time series data (alternative to labels/datasets) */
  timeSeriesData?: TimeSeriesDataPoint[];
  /** Maximum number of data points for time series */
  maxDataPoints?: number;
  /** Whether to use time scale */
  useTimeScale?: boolean;
  /** Custom class name */
  class?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Theme for the chart */
  theme?: ReynardTheme;
}
export declare const LineChart: Component<LineChartProps>;
