/**
 * Charts package i18n utilities
 * Provides optional i18n support with fallback translations
 */

import { t as coreTranslate, registerFallbackTranslations } from "reynard-core";

// Register charts-specific fallback translations
registerFallbackTranslations("charts", {
  // Loading states
  loading: "Loading...",
  loadingData: "Loading Data...",
  loadingStatisticalData: "Loading statistical data...",
  loadingEmbeddingQuality: "Loading embedding quality analysis...",

  // Data states
  noData: "No Data Available",
  error: "Error Loading Data",
  refresh: "Refresh Data",

  // Export options
  exportImage: "Export as Image",
  exportCsv: "Export as CSV",
  exportPdf: "Export as PDF",

  // Legend controls
  showLegend: "Show Legend",
  hideLegend: "Hide Legend",
  legendPosition: "Legend Position",

  // Axes
  xAxis: "X Axis",
  yAxis: "Y Axis",
  axisTitle: "Axis Title",
  axisLabel: "Axis Label",
  valueRange: "Value Range",
  frequency: "Frequency",
  metric: "Metric",
  value: "Value",
  qualityMetrics: "Quality Metrics",
  score: "Score",
  models: "Models",
  hoursAgo: "hours ago",

  // Chart types
  "chartTypes.line": "Line Chart",
  "chartTypes.bar": "Bar Chart",
  "chartTypes.pie": "Pie Chart",
  "chartTypes.doughnut": "Doughnut Chart",
  "chartTypes.area": "Area Chart",
  "chartTypes.scatter": "Scatter Plot",
  "chartTypes.histogram": "Histogram",
  "chartTypes.boxplot": "Box Plot",
  "chartTypes.qualityBar": "Quality Bar",
  "chartTypes.qualityGauge": "Quality Gauge",

  // Statistics
  "statistics.mean": "Mean",
  "statistics.median": "Median",
  "statistics.mode": "Mode",
  "statistics.standardDeviation": "Standard Deviation",
  "statistics.variance": "Variance",
  "statistics.range": "Range",
  "statistics.min": "Minimum",
  "statistics.max": "Maximum",
  "statistics.count": "Count",
  "statistics.sum": "Sum",

  // Quality assessments
  "quality.excellent": "Excellent",
  "quality.good": "Good",
  "quality.fair": "Fair",
  "quality.poor": "Poor",
  "quality.assessment": "Quality Assessment",
  "quality.metrics": "Quality Metrics",
  "quality.overall": "Overall Quality",

  // Performance metrics
  "performance.fps": "FPS",
  "performance.renderTime": "Render Time",
  "performance.dataPoints": "Data Points",
  "performance.activeVisualizations": "Active Visualizations",
});

/**
 * Translation function for charts package
 * Uses core i18n with charts-specific fallbacks
 */
export function t(key: string, params?: Record<string, unknown>): string {
  // Try charts-specific key first
  const chartsKey = `charts.${key}`;
  const result = coreTranslate(chartsKey, params);

  // If we got the key back (no translation found), try without prefix
  if (result === chartsKey) {
    return coreTranslate(key, params);
  }

  return result;
}

/**
 * Get chart type display name
 */
export function getChartTypeName(chartType: string): string {
  return t(`chartTypes.${chartType}`, { fallback: chartType });
}

/**
 * Get axis label with fallback
 */
export function getAxisLabel(axis: "x" | "y", customLabel?: string): string {
  if (customLabel) {
    return customLabel;
  }
  return t(`${axis}Axis`);
}

/**
 * Get loading message for specific chart type
 */
export function getLoadingMessage(chartType?: string): string {
  switch (chartType) {
    case "statistical":
      return t("loadingStatisticalData");
    case "embedding-quality":
      return t("loadingEmbeddingQuality");
    default:
      return t("loadingData");
  }
}

/**
 * Get quality assessment text
 */
export function getQualityText(quality: "excellent" | "good" | "fair" | "poor"): string {
  return t(`quality.${quality}`);
}

/**
 * Get statistics label
 */
export function getStatisticsLabel(stat: string): string {
  return t(`statistics.${stat}`, { fallback: stat });
}

// Re-export core i18n utilities for convenience
export { isI18nAvailable, getI18nModule, createMockI18n } from "reynard-core";
