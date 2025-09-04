/**
 * Chart Types and Interfaces
 */

export interface DataPoint {
  /** X-axis value or timestamp */
  x?: number | string;
  /** Y-axis value */
  y: number;
  /** Optional label for the data point */
  label?: string;
}

export interface TimeSeriesDataPoint {
  /** Timestamp */
  timestamp: number;
  /** Value */
  value: number;
  /** Display label */
  label: string;
}

export interface Dataset {
  /** Dataset label */
  label: string;
  /** Data values */
  data: number[] | DataPoint[];
  /** Background color */
  backgroundColor?: string | string[];
  /** Border color */
  borderColor?: string | string[];
  /** Border width */
  borderWidth?: number;
  /** Fill area under line */
  fill?: boolean;
  /** Line tension (for line charts) */
  tension?: number;
  /** Point radius */
  pointRadius?: number;
  /** Point hover radius */
  pointHoverRadius?: number;
  /** Hidden state */
  hidden?: boolean;
}

export interface ChartOptions {
  /** Chart title */
  title?: string;
  /** Chart width */
  width?: number;
  /** Chart height */
  height?: number;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether chart is responsive */
  responsive?: boolean;
  /** Maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Animation options */
  animation?: {
    duration?: number;
    easing?: string;
  };
}

export interface AxisOptions {
  /** Axis label */
  label?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Show axis */
  display?: boolean;
  /** Axis position */
  position?: "left" | "right" | "top" | "bottom";
  /** Grid line options */
  grid?: {
    display?: boolean;
    color?: string;
    lineWidth?: number;
  };
  /** Tick options */
  ticks?: {
    display?: boolean;
    color?: string;
    font?: {
      size?: number;
      family?: string;
      weight?: string | number;
    };
    callback?: (value: any, index: number, values: any[]) => string;
  };
}

export interface ChartConfig extends ChartOptions {
  /** X-axis configuration */
  xAxis?: AxisOptions;
  /** Y-axis configuration */
  yAxis?: AxisOptions;
  /** Color palette */
  colors?: string[];
  /** Tooltip configuration */
  tooltip?: {
    enabled?: boolean;
    backgroundColor?: string;
    titleColor?: string;
    bodyColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}

export type ChartType = "line" | "bar" | "doughnut" | "pie" | "radar" | "polarArea" | "scatter" | "bubble";

export interface ChartTheme {
  /** Primary color */
  primary: string;
  /** Secondary color */
  secondary: string;
  /** Success color */
  success: string;
  /** Warning color */
  warning: string;
  /** Danger color */
  danger: string;
  /** Info color */
  info: string;
  /** Background color */
  background: string;
  /** Text color */
  text: string;
  /** Grid color */
  grid: string;
}

export const DEFAULT_COLORS = [
  "rgba(54, 162, 235, 1)",   // Blue
  "rgba(255, 99, 132, 1)",   // Red
  "rgba(75, 192, 192, 1)",   // Green
  "rgba(153, 102, 255, 1)",  // Purple
  "rgba(255, 159, 64, 1)",   // Orange
  "rgba(255, 205, 86, 1)",   // Yellow
  "rgba(231, 233, 237, 1)",  // Gray
  "rgba(255, 99, 255, 1)",   // Pink
];

export const DEFAULT_THEME: ChartTheme = {
  primary: "rgba(54, 162, 235, 1)",
  secondary: "rgba(75, 192, 192, 1)",
  success: "rgba(76, 175, 80, 1)",
  warning: "rgba(255, 193, 7, 1)",
  danger: "rgba(244, 67, 54, 1)",
  info: "rgba(33, 150, 243, 1)",
  background: "rgba(255, 255, 255, 1)",
  text: "rgba(0, 0, 0, 0.87)",
  grid: "rgba(0, 0, 0, 0.1)",
};
