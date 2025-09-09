/**
 * Chart Components
 * Data visualization components for SolidJS
 */

// Legacy components (maintained for backward compatibility)
export { LineChart, type LineChartProps } from "./LineChart";
export { BarChart, type BarChartProps } from "./BarChart";
export { PieChart, type PieChartProps } from "./PieChart";
export { TimeSeriesChart, type TimeSeriesChartProps } from "./TimeSeriesChart";

// New unified components with OKLCH integration
export { Chart, type ChartProps } from "./Chart";
export {
  RealTimeChart,
  type RealTimeChartProps,
  type RealTimeDataPoint,
} from "./RealTimeChart";
export {
  StatisticalChart,
  type StatisticalChartProps,
  type StatisticalData,
  type QualityData,
  type QualityMetric,
} from "./StatisticalChart";
