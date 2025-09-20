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
export { RealTimeChart, type RealTimeChartProps, type RealTimeDataPoint } from "./RealTimeChart";
export {
  StatisticalChart,
  type StatisticalChartProps,
  type StatisticalData,
  type QualityData,
  type QualityMetric,
} from "./StatisticalChart";

// Advanced charting components
export { ModelUsageChart, type ModelUsageChartProps, type ModelUsageData } from "./ModelUsageChart";
export {
  EmbeddingDistributionChart,
  type EmbeddingDistributionChartProps,
  type EmbeddingDistributionData,
} from "./EmbeddingDistributionChart";
export { PCAVarianceChart, type PCAVarianceChartProps, type PCAVarianceData } from "./PCAVarianceChart";
export { AdvancedChartingDashboard, type AdvancedChartingDashboardProps } from "./AdvancedChartingDashboard";

// Embedding visualization components
export {
  EmbeddingQualityChart,
  type EmbeddingQualityChartProps,
  type EmbeddingQualityData,
  type QualityMetric as EmbeddingQualityMetric,
} from "./EmbeddingQualityChart";
export {
  EmbeddingVisualizationDashboard,
  type EmbeddingVisualizationDashboardProps,
} from "./EmbeddingVisualizationDashboard";
export { Embedding3DVisualization, type Embedding3DVisualizationProps } from "./Embedding3DVisualization";
