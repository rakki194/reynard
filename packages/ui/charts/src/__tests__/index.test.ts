import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateChartData,
  prepareDatasets,
  getDefaultConfig,
  applyTheme,
  formatValue,
  formatTimestamp,
  debounce,
  calculateDimensions,
  processTimeSeriesData,
  aggregateByInterval,
} from "../index";
import { generateColorsWithCache } from "reynard-colors";
import type { Dataset } from "../types";

const mockDatasets: Dataset[] = [
  {
    label: "Sales",
    data: [10, 20, 30, 40, 50],
    backgroundColor: "rgba(54, 162, 235, 0.5)",
    borderColor: "rgba(54, 162, 235, 1)",
    borderWidth: 1,
  },
  {
    label: "Revenue",
    data: [15, 25, 35, 45, 55],
    backgroundColor: "rgba(255, 99, 132, 0.5)",
    borderColor: "rgba(255, 99, 132, 1)",
    borderWidth: 1,
  },
];

const mockLabels = ["Jan", "Feb", "Mar", "Apr", "May"];

describe("Chart Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateChartData", () => {
    it("returns true for valid data", () => {
      const result = validateChartData(mockDatasets, mockLabels);
      expect(result).toBe(true);
    });

    it("returns false when datasets array is empty", () => {
      const result = validateChartData([], mockLabels);
      expect(result).toBe(false);
    });

    it("returns false when labels array is empty", () => {
      const result = validateChartData(mockDatasets, []);
      expect(result).toBe(false);
    });

    it("returns false when dataset data length doesn't match labels length", () => {
      const invalidDatasets = [
        {
          ...mockDatasets[0],
          data: [10, 20, 30], // Only 3 values instead of 5
        },
      ];
      const result = validateChartData(invalidDatasets, mockLabels);
      expect(result).toBe(false);
    });

    it("returns false when dataset has empty data array", () => {
      const invalidDatasets = [
        {
          ...mockDatasets[0],
          data: [], // Empty data array
        },
      ];
      const result = validateChartData(invalidDatasets, mockLabels);
      expect(result).toBe(false);
    });

    it("handles null and undefined inputs gracefully", () => {
      expect(validateChartData(null as any, mockLabels)).toBe(false);
      expect(validateChartData(undefined as any, mockLabels)).toBe(false);
      // The function doesn't validate labels, so it should return true when datasets are valid
      expect(validateChartData(mockDatasets, null as any)).toBe(true);
      expect(validateChartData(mockDatasets, undefined as any)).toBe(true);
    });

    it("handles datasets with non-array data", () => {
      const invalidDatasets = [
        {
          ...mockDatasets[0],
          data: "not an array" as any,
        },
      ];
      const result = validateChartData(invalidDatasets, mockLabels);
      expect(result).toBe(false);
    });
  });

  describe("prepareDatasets", () => {
    it("processes datasets correctly", () => {
      const result = prepareDatasets(mockDatasets);
      expect(result).toEqual(mockDatasets);
    });

    it("handles empty datasets array", () => {
      const result = prepareDatasets([]);
      expect(result).toEqual([]);
    });

    it("ensures all datasets have required properties", () => {
      const incompleteDataset = {
        label: "Incomplete",
        data: [1, 2, 3],
      };
      const result = prepareDatasets([incompleteDataset as Dataset]);
      expect(result[0]).toHaveProperty("backgroundColor");
      expect(result[0]).toHaveProperty("borderColor");
      expect(result[0]).toHaveProperty("borderWidth");
    });

    it("handles datasets with missing optional properties", () => {
      const minimalDataset = {
        label: "Minimal",
        data: [1, 2, 3],
      };
      const result = prepareDatasets([minimalDataset as Dataset]);
      expect(result[0].backgroundColor).toBeDefined();
      expect(result[0].borderColor).toBeDefined();
      expect(result[0].borderWidth).toBe(2);
    });

    it("preserves existing properties when provided", () => {
      const customDataset = {
        label: "Custom",
        data: [1, 2, 3],
        backgroundColor: "custom-color",
        borderColor: "custom-border",
        borderWidth: 5,
      };
      const result = prepareDatasets([customDataset as Dataset]);
      expect(result[0].backgroundColor).toBe("custom-color");
      expect(result[0].borderColor).toBe("custom-border");
      expect(result[0].borderWidth).toBe(5);
    });
  });

  describe("getDefaultConfig", () => {
    it("returns default configuration for line chart", () => {
      const result = getDefaultConfig("line");
      expect(result).toHaveProperty("responsive");
      expect(result).toHaveProperty("maintainAspectRatio");
      expect(result).toHaveProperty("plugins");
      expect(result).toHaveProperty("scales");
    });

    it("returns expected default values for line chart", () => {
      const result = getDefaultConfig("line");
      expect(result.responsive).toBe(true);
      expect(result.maintainAspectRatio).toBe(false);
      expect(result.plugins?.legend?.display).toBe(true);
      // Type assertion for line chart specific properties
      const lineConfig = result as any;
      expect(lineConfig.scales?.x?.grid?.display).toBe(true);
      expect(lineConfig.scales?.y?.grid?.display).toBe(true);
    });

    it("returns default configuration for bar chart", () => {
      const result = getDefaultConfig("bar");
      expect(result).toHaveProperty("responsive");
      expect(result).toHaveProperty("maintainAspectRatio");
      expect(result).toHaveProperty("plugins");
      expect(result).toHaveProperty("scales");
    });

    it("returns expected default values for bar chart", () => {
      const result = getDefaultConfig("bar");
      expect(result.responsive).toBe(true);
      expect(result.maintainAspectRatio).toBe(false);
      expect(result.plugins?.legend?.display).toBe(true);
      // Type assertion for bar chart specific properties
      const barConfig = result as any;
      expect(barConfig.scales?.x?.grid?.display).toBe(false);
      expect(barConfig.scales?.y?.grid?.display).toBe(true);
    });

    it("returns default configuration for pie chart", () => {
      const result = getDefaultConfig("pie");
      expect(result).toHaveProperty("responsive");
      expect(result).toHaveProperty("maintainAspectRatio");
      expect(result).toHaveProperty("plugins");
    });

    it("returns default configuration for doughnut chart", () => {
      const result = getDefaultConfig("doughnut");
      expect(result).toHaveProperty("responsive");
      expect(result).toHaveProperty("maintainAspectRatio");
      expect(result).toHaveProperty("plugins");
    });

    it("applies custom theme when provided", () => {
      const customTheme = {
        primary: "#FF0000",
        text: "#FFFFFF",
        background: "#000000",
        grid: "#333333",
      };
      const result = getDefaultConfig("line", customTheme);
      expect(result).toBeDefined();
    });
  });

  describe("generateColorsWithCache", () => {
    it("generates the correct number of colors", () => {
      const colors = generateColorsWithCache(5);
      expect(colors).toHaveLength(5);
    });

    it("generates colors with custom opacity", () => {
      const colors = generateColorsWithCache(3, 0, 0.3, 0.6, 0.5);
      expect(colors).toHaveLength(3);
      // Colors should be valid CSS color strings
      colors.forEach(color => {
        expect(typeof color).toBe("string");
        expect(color.length).toBeGreaterThan(0);
      });
    });

    it("handles zero count", () => {
      const colors = generateColorsWithCache(0);
      expect(colors).toHaveLength(0);
    });

    it("handles large count", () => {
      const colors = generateColorsWithCache(100);
      expect(colors).toHaveLength(100);
      // All colors should be valid strings
      expect(colors.every(color => typeof color === "string")).toBe(true);
    });

    it("generates consistent colors", () => {
      const colors1 = generateColorsWithCache(3);
      const colors2 = generateColorsWithCache(3);
      expect(colors1).toEqual(colors2);
    });
  });

  describe("applyTheme", () => {
    it("applies custom theme properties", () => {
      const customTheme = {
        primary: "#FF0000",
        text: "#FFFFFF",
      };
      const result = applyTheme(customTheme);
      expect(result.primary).toBe("#FF0000");
      expect(result.text).toBe("#FFFFFF");
    });

    it("preserves default theme for missing properties", () => {
      const customTheme = {
        primary: "#FF0000",
      };
      const result = applyTheme(customTheme);
      expect(result.primary).toBe("#FF0000");
      expect(result.secondary).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it("handles empty theme object", () => {
      const result = applyTheme({});
      expect(result.primary).toBeDefined();
      expect(result.secondary).toBeDefined();
    });

    it("handles undefined theme", () => {
      const result = applyTheme();
      expect(result.primary).toBeDefined();
      expect(result.secondary).toBeDefined();
    });
  });

  describe("formatValue", () => {
    it("formats number values correctly", () => {
      expect(formatValue(1234.56)).toBe("1,234.56");
      expect(formatValue(0)).toBe("0");
      expect(formatValue(-123)).toBe("-123");
    });

    it("formats currency values correctly", () => {
      expect(formatValue(1234.56, "currency")).toBe("$1,234.56");
      expect(formatValue(0, "currency")).toBe("$0.00");
      expect(formatValue(-123, "currency")).toBe("-$123.00");
    });

    it("formats percentage values correctly", () => {
      expect(formatValue(0.1234, "percentage")).toBe("12.3%");
      expect(formatValue(0, "percentage")).toBe("0.0%");
      expect(formatValue(1, "percentage")).toBe("100.0%");
    });

    it("handles edge cases", () => {
      expect(formatValue(Infinity)).toBe("∞");
      expect(formatValue(-Infinity)).toBe("-∞");
      expect(formatValue(NaN)).toBe("NaN");
    });
  });

  describe("formatTimestamp", () => {
    it("formats time correctly", () => {
      const timestamp = Date.now();
      const result = formatTimestamp(timestamp, "time");
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it("formats date correctly", () => {
      const timestamp = Date.now();
      const result = formatTimestamp(timestamp, "date");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("formats datetime correctly", () => {
      const timestamp = Date.now();
      const result = formatTimestamp(timestamp, "datetime");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("handles invalid timestamps", () => {
      expect(formatTimestamp(NaN)).toBe("Invalid Date");
      expect(formatTimestamp(0)).toBeDefined();
    });
  });

  describe("debounce", () => {
    it("debounces function calls correctly", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("passes arguments correctly", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("arg1", "arg2");
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("handles zero delay", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe("calculateDimensions", () => {
    it("calculates dimensions correctly", () => {
      const mockContainer = {
        clientWidth: 800,
        clientHeight: 600,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer, 2);
      expect(result.width).toBe(800);
      expect(result.height).toBe(400);
    });

    it("enforces minimum dimensions", () => {
      const mockContainer = {
        clientWidth: 200,
        clientHeight: 100,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer, 2);
      expect(result.width).toBe(300);
      expect(result.height).toBe(200);
    });

    it("handles custom aspect ratio", () => {
      const mockContainer = {
        clientWidth: 1000,
        clientHeight: 500,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer, 4);
      expect(result.width).toBe(1000);
      expect(result.height).toBe(250);
    });

    it("handles zero container dimensions", () => {
      const mockContainer = {
        clientWidth: 0,
        clientHeight: 0,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer);
      expect(result.width).toBe(300);
      expect(result.height).toBe(200);
    });
  });

  describe("processTimeSeriesData", () => {
    it("processes time series data correctly", () => {
      const data = [
        { timestamp: 1000, value: 10, label: "Point 1" },
        { timestamp: 2000, value: 20, label: "Point 2" },
        { timestamp: 3000, value: 30, label: "Point 3" },
      ];

      const result = processTimeSeriesData(data);
      expect(result.labels).toEqual(["Point 1", "Point 2", "Point 3"]);
      expect(result.data).toEqual([10, 20, 30]);
    });

    it("sorts data by timestamp", () => {
      const data = [
        { timestamp: 3000, value: 30 },
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
      ];

      const result = processTimeSeriesData(data);
      expect(result.data).toEqual([10, 20, 30]);
    });

    it("limits data points for performance", () => {
      const data = Array.from({ length: 150 }, (_, i) => ({
        timestamp: i * 1000,
        value: i,
      }));

      const result = processTimeSeriesData(data, 100);
      expect(result.data).toHaveLength(100);
      expect(result.data[0]).toBe(50); // Should start from index 50
    });

    it("generates labels from timestamps when not provided", () => {
      const data = [
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
      ];

      const result = processTimeSeriesData(data);
      expect(result.labels).toHaveLength(2);
      expect(result.labels[0]).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it("handles empty data array", () => {
      const result = processTimeSeriesData([]);
      expect(result.labels).toEqual([]);
      expect(result.data).toEqual([]);
    });
  });

  describe("aggregateByInterval", () => {
    it("aggregates data by time intervals correctly", () => {
      const data = [
        { timestamp: 1000, value: 10 },
        { timestamp: 1500, value: 20 },
        { timestamp: 2000, value: 30 },
        { timestamp: 2500, value: 40 },
      ];

      const result = aggregateByInterval(data, 1000);
      expect(result).toHaveLength(2); // Only 2 intervals: 1000-1999 and 2000-2999
      expect(result[0].timestamp).toBe(1000);
      expect(result[0].value).toBe(15); // Average of 10 and 20
      expect(result[0].count).toBe(2);
    });

    it("handles data outside intervals", () => {
      const data = [
        { timestamp: 1000, value: 10 },
        { timestamp: 3000, value: 30 },
      ];

      const result = aggregateByInterval(data, 1000);
      expect(result).toHaveLength(2);
      expect(result[0].timestamp).toBe(1000);
      expect(result[1].timestamp).toBe(3000);
    });

    it("handles empty data array", () => {
      const result = aggregateByInterval([], 1000);
      expect(result).toEqual([]);
    });

    it("handles zero interval", () => {
      const data = [
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
      ];

      const result = aggregateByInterval(data, 0);
      expect(result).toHaveLength(1); // With zero interval, all data gets aggregated into one group
    });

    it("handles negative interval", () => {
      const data = [
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
      ];

      const result = aggregateByInterval(data, -1000);
      expect(result).toHaveLength(2);
    });
  });

  describe("Performance Tests", () => {
    it("processes large datasets efficiently", () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        timestamp: i * 1000,
        value: Math.random() * 100,
      }));

      const startTime = performance.now();
      const result = processTimeSeriesData(largeData, 1000);
      const endTime = performance.now();

      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should process in under 100ms
    });

    it("generates colors efficiently", () => {
      const startTime = performance.now();
      const colors = generateColorsWithCache(1000);
      const endTime = performance.now();

      expect(colors).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(50); // Should generate in under 50ms
    });

    it("validates large datasets efficiently", () => {
      const largeDatasets = Array.from({ length: 100 }, (_, i) => ({
        label: `Dataset ${i}`,
        data: Array.from({ length: 1000 }, () => Math.random() * 100),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      }));

      const startTime = performance.now();
      const result = validateChartData(
        largeDatasets,
        Array.from({ length: 1000 }, (_, i) => `Label ${i}`)
      );
      const endTime = performance.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should validate in under 50ms
    });
  });

  describe("Error Handling", () => {
    it("handles malformed data gracefully", () => {
      const malformedData = [{ timestamp: "invalid", value: "not a number" } as any];

      expect(() => processTimeSeriesData(malformedData)).not.toThrow();
    });

    it("handles extreme values", () => {
      const extremeData = [
        { timestamp: Number.MAX_SAFE_INTEGER, value: Number.MAX_VALUE },
        { timestamp: Number.MIN_SAFE_INTEGER, value: Number.MIN_VALUE },
      ];

      expect(() => processTimeSeriesData(extremeData)).not.toThrow();
    });

    it("handles missing properties in datasets", () => {
      const incompleteData = [{ label: "Incomplete" } as any];

      expect(() => prepareDatasets(incompleteData)).not.toThrow();
    });
  });
});
