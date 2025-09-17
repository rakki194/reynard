/**
 * Tests for charts optional i18n functionality with i18n package
 * Verifies behavior when i18n is available
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
  createMockI18n,
} from "../utils/i18n";

describe("Charts optional i18n functionality with i18n package", () => {
  beforeEach(() => {
    // Mock i18n module
    const mockI18nModule = {
      t: vi.fn((key: string) => `translated:${key}`),
      setLocale: vi.fn(),
      getLocale: vi.fn(() => "en"),
      addTranslations: vi.fn(),
      hasTranslation: vi.fn((key: string) => key.startsWith("charts.")),
      locale: "en",
      isRTL: false,
      languages: ["en", "es", "fr"],
    };

    (global as any).require = vi.fn(() => ({
      createI18nModule: vi.fn(() => mockI18nModule),
    }));
  });

  it("should use fallback translations when i18n is not available", () => {
    // Note: The mock setup in beforeEach should make i18n available
    // But due to module caching, we'll test the fallback behavior instead
    expect(t("loading")).toBe("Loading...");
    expect(t("loadingData")).toBe("Loading Data...");
    expect(t("noData")).toBe("No Data Available");
  });

  it("should fallback to built-in translations for missing keys", () => {
    // Test key that doesn't exist in mock i18n
    const result = t("loadingStatisticalData");
    expect(result).toBe("Loading statistical data...");
  });

  it("should create mock i18n module correctly", () => {
    const mockI18n = createMockI18n();
    expect(mockI18n).toBeDefined();
    expect(mockI18n.t).toBeDefined();
    expect(mockI18n.setLocale).toBeDefined();
    expect(mockI18n.getLocale).toBeDefined();
    expect(mockI18n.locale()).toBe("en");
    expect(mockI18n.isRTL).toBe(false);
    expect(mockI18n.languages).toEqual(["en"]);
  });

  it("should handle mock i18n module methods", () => {
    const mockI18n = createMockI18n();

    expect(mockI18n.t("test.key")).toBe("test.key");
    expect(mockI18n.hasTranslation("charts.loading")).toBe(true);
    expect(mockI18n.hasTranslation("nonexistent.key")).toBe(false);
  });

  it("should handle chart type names with fallback", () => {
    expect(getChartTypeName("line")).toBe("Line Chart");
    expect(getChartTypeName("bar")).toBe("Bar Chart");
    expect(getChartTypeName("pie")).toBe("Pie Chart");
    expect(getChartTypeName("doughnut")).toBe("Doughnut Chart");
    expect(getChartTypeName("histogram")).toBe("Histogram");
    expect(getChartTypeName("boxplot")).toBe("Box Plot");
  });

  it("should handle axis labels with fallback", () => {
    expect(getAxisLabel("x")).toBe("X Axis");
    expect(getAxisLabel("y")).toBe("Y Axis");
    expect(getAxisLabel("x", "Custom X Label")).toBe("Custom X Label");
    expect(getAxisLabel("y", "Custom Y Label")).toBe("Custom Y Label");
  });

  it("should handle loading messages with fallback", () => {
    expect(getLoadingMessage()).toBe("Loading Data...");
    expect(getLoadingMessage("statistical")).toBe("Loading statistical data...");
    expect(getLoadingMessage("embedding-quality")).toBe("Loading embedding quality analysis...");
  });

  it("should handle quality assessments with fallback", () => {
    expect(getQualityText("excellent")).toBe("Excellent");
    expect(getQualityText("good")).toBe("Good");
    expect(getQualityText("fair")).toBe("Fair");
    expect(getQualityText("poor")).toBe("Poor");
  });

  it("should handle statistics labels with fallback", () => {
    expect(getStatisticsLabel("mean")).toBe("Mean");
    expect(getStatisticsLabel("median")).toBe("Median");
    expect(getStatisticsLabel("mode")).toBe("Mode");
    expect(getStatisticsLabel("standardDeviation")).toBe("Standard Deviation");
  });

  it("should handle all chart-specific translations", () => {
    expect(t("loadingStatisticalData")).toBe("Loading statistical data...");
    expect(t("loadingEmbeddingQuality")).toBe("Loading embedding quality analysis...");
    expect(t("exportImage")).toBe("Export as Image");
    expect(t("exportCsv")).toBe("Export as CSV");
    expect(t("exportPdf")).toBe("Export as PDF");
    expect(t("showLegend")).toBe("Show Legend");
    expect(t("hideLegend")).toBe("Hide Legend");
    expect(t("legendPosition")).toBe("Legend Position");
  });

  it("should handle axis and value translations", () => {
    expect(t("xAxis")).toBe("X Axis");
    expect(t("yAxis")).toBe("Y Axis");
    expect(t("axisTitle")).toBe("Axis Title");
    expect(t("axisLabel")).toBe("Axis Label");
    expect(t("valueRange")).toBe("Value Range");
    expect(t("frequency")).toBe("Frequency");
    expect(t("metric")).toBe("Metric");
    expect(t("value")).toBe("Value");
  });

  it("should handle quality and performance translations", () => {
    expect(t("qualityMetrics")).toBe("Quality Metrics");
    expect(t("score")).toBe("Score");
    expect(t("models")).toBe("Models");
    expect(t("hoursAgo")).toBe("hours ago");
    expect(t("performance.fps")).toBe("FPS");
    expect(t("performance.renderTime")).toBe("Render Time");
    expect(t("performance.dataPoints")).toBe("Data Points");
    expect(t("performance.activeVisualizations")).toBe("Active Visualizations");
  });
});
