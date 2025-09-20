/**
 * Tests for charts optional i18n functionality without i18n package
 * Verifies fallback behavior when i18n is not available
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  t,
  getChartTypeName,
  getAxisLabel,
  getLoadingMessage,
  getQualityText,
  getStatisticsLabel,
  isI18nAvailable,
  getI18nModule,
} from "../utils/i18n";

describe("Charts optional i18n functionality without i18n package", () => {
  beforeEach(() => {
    // Mock require to throw error (simulating missing i18n package)
    (global as any).require = vi.fn(() => {
      throw new Error("Cannot find module 'reynard-i18n'");
    });
  });

  it("should return fallback translations when i18n is not available", () => {
    expect(isI18nAvailable()).toBe(false);
    expect(getI18nModule()).toBe(null);

    // Test basic fallback translations
    expect(t("loading")).toBe("Loading...");
    expect(t("loadingData")).toBe("Loading Data...");
    expect(t("noData")).toBe("No Data Available");
    expect(t("error")).toBe("Error Loading Data");
  });

  it("should handle chart-specific translations", () => {
    expect(t("loadingStatisticalData")).toBe("Loading statistical data...");
    expect(t("loadingEmbeddingQuality")).toBe("Loading embedding quality analysis...");
    expect(t("exportImage")).toBe("Export as Image");
    expect(t("exportCsv")).toBe("Export as CSV");
    expect(t("exportPdf")).toBe("Export as PDF");
  });

  it("should handle chart type names", () => {
    expect(getChartTypeName("line")).toBe("Line Chart");
    expect(getChartTypeName("bar")).toBe("Bar Chart");
    expect(getChartTypeName("pie")).toBe("Pie Chart");
    expect(getChartTypeName("doughnut")).toBe("Doughnut Chart");
    expect(getChartTypeName("histogram")).toBe("Histogram");
    expect(getChartTypeName("boxplot")).toBe("Box Plot");
  });

  it("should handle axis labels", () => {
    expect(getAxisLabel("x")).toBe("X Axis");
    expect(getAxisLabel("y")).toBe("Y Axis");
    expect(getAxisLabel("x", "Custom X Label")).toBe("Custom X Label");
    expect(getAxisLabel("y", "Custom Y Label")).toBe("Custom Y Label");
  });

  it("should handle loading messages", () => {
    expect(getLoadingMessage()).toBe("Loading Data...");
    expect(getLoadingMessage("statistical")).toBe("Loading statistical data...");
    expect(getLoadingMessage("embedding-quality")).toBe("Loading embedding quality analysis...");
    expect(getLoadingMessage("unknown")).toBe("Loading Data...");
  });

  it("should handle quality assessments", () => {
    expect(getQualityText("excellent")).toBe("Excellent");
    expect(getQualityText("good")).toBe("Good");
    expect(getQualityText("fair")).toBe("Fair");
    expect(getQualityText("poor")).toBe("Poor");
  });

  it("should handle statistics labels", () => {
    expect(getStatisticsLabel("mean")).toBe("Mean");
    expect(getStatisticsLabel("median")).toBe("Median");
    expect(getStatisticsLabel("mode")).toBe("Mode");
    expect(getStatisticsLabel("standardDeviation")).toBe("Standard Deviation");
    expect(getStatisticsLabel("variance")).toBe("Variance");
    expect(getStatisticsLabel("range")).toBe("Range");
    expect(getStatisticsLabel("min")).toBe("Minimum");
    expect(getStatisticsLabel("max")).toBe("Maximum");
    expect(getStatisticsLabel("count")).toBe("Count");
    expect(getStatisticsLabel("sum")).toBe("Sum");
  });

  it("should handle parameter substitution in fallback translations", () => {
    // Test with hours ago parameter
    expect(t("hoursAgo")).toBe("hours ago");
  });

  it("should return the key when no fallback translation exists", () => {
    const result = t("charts.nonexistent.key");
    expect(result).toBe("charts.nonexistent.key");
  });

  it("should handle null and undefined parameters", () => {
    expect(t("loading", null as any)).toBe("Loading...");
    expect(t("loading", undefined as any)).toBe("Loading...");
  });

  it("should handle empty parameter objects", () => {
    const result = t("loading", {});
    expect(result).toBe("Loading...");
  });

  it("should handle legend and axis translations", () => {
    expect(t("showLegend")).toBe("Show Legend");
    expect(t("hideLegend")).toBe("Hide Legend");
    expect(t("legendPosition")).toBe("Legend Position");
    expect(t("axisTitle")).toBe("Axis Title");
    expect(t("axisLabel")).toBe("Axis Label");
  });

  it("should handle value and metric translations", () => {
    expect(t("valueRange")).toBe("Value Range");
    expect(t("frequency")).toBe("Frequency");
    expect(t("metric")).toBe("Metric");
    expect(t("value")).toBe("Value");
    expect(t("qualityMetrics")).toBe("Quality Metrics");
    expect(t("score")).toBe("Score");
    expect(t("models")).toBe("Models");
  });

  it("should handle performance metrics", () => {
    expect(t("performance.fps")).toBe("FPS");
    expect(t("performance.renderTime")).toBe("Render Time");
    expect(t("performance.dataPoints")).toBe("Data Points");
    expect(t("performance.activeVisualizations")).toBe("Active Visualizations");
  });
});
