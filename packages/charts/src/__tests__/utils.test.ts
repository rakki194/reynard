import { describe, it, expect, vi } from "vitest";
import {
  validateChartData,
  prepareDatasets,
  formatValue,
  formatTimestamp,
  debounce,
  processTimeSeriesData,
  aggregateByInterval,
  calculateDimensions,
  getDefaultConfig,
  applyTheme,
} from "../utils";
import type { Dataset } from "../types";

describe("Chart Utilities", () => {
  describe("validateChartData", () => {
    it("should validate correct chart data", () => {
      const datasets: Dataset[] = [
        {
          label: "Test",
          data: [1, 2, 3],
        },
      ];
      const labels = ["A", "B", "C"];

      const result = validateChartData(datasets, labels);
      expect(result).toBe(true);
    });

    it("should reject empty datasets", () => {
      const result = validateChartData([], ["A", "B", "C"]);
      expect(result).toBe(false);
    });

    it("should reject null datasets", () => {
      const result = validateChartData(null as any, ["A", "B", "C"]);
      expect(result).toBe(false);
    });
  });

  describe("prepareDatasets", () => {
    it("should prepare datasets with defaults", () => {
      const input: Partial<Dataset>[] = [
        {
          label: "Test",
          data: [1, 2, 3],
        },
      ];

      const result = prepareDatasets(input);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("Test");
      expect(result[0].data).toEqual([1, 2, 3]);
    });

    it("should handle empty input", () => {
      const result = prepareDatasets([]);
      expect(result).toEqual([]);
    });
  });

  describe("formatValue", () => {
    it("should format numbers correctly", () => {
      expect(formatValue(1234.56)).toBe("1,234.56");
      expect(formatValue(1000)).toBe("1,000");
      expect(formatValue(0)).toBe("0");
    });

    it("should handle edge cases", () => {
      expect(formatValue(null as any)).toBe("0");
      expect(formatValue(undefined as any)).toBe("0");
    });
  });

  describe("formatTimestamp", () => {
    it("should format timestamps correctly", () => {
      const timestamp = new Date("2025-01-01T12:00:00Z").getTime();
      const result = formatTimestamp(timestamp);
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/); // Should match time format
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", async () => {
      let callCount = 0;
      const fn = debounce(() => {
        callCount++;
      }, 50);

      // Call multiple times quickly
      fn();
      fn();
      fn();

      // Should only be called once after delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(callCount).toBe(1);
    });
  });

  describe("prepareDatasets", () => {
    it("should prepare datasets with automatic color assignment", () => {
      const partialDatasets = [
        { label: "Dataset 1", data: [1, 2, 3] },
        { label: "Dataset 2", data: [4, 5, 6] },
      ];

      const result = prepareDatasets(partialDatasets);

      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("Dataset 1");
      expect(result[0].data).toEqual([1, 2, 3]);
      expect(result[0].backgroundColor).toBeDefined();
      expect(result[0].borderColor).toBeDefined();
      expect(result[0].borderWidth).toBe(2);
    });

    it("should handle empty input", () => {
      const result = prepareDatasets([]);
      expect(result).toEqual([]);
    });

    it("should assign default labels for datasets without labels", () => {
      const partialDatasets = [{ data: [1, 2, 3] }, { data: [4, 5, 6] }];

      const result = prepareDatasets(partialDatasets);

      expect(result[0].label).toBe("Dataset 1");
      expect(result[1].label).toBe("Dataset 2");
    });
  });

  // Note: getDefaultConfig, applyTheme, and calculateDimensions are not exported from utils
  // They may be in other files or not implemented yet

  describe("processTimeSeriesData", () => {
    it("should process time series data", () => {
      const data = [
        { timestamp: 1640995200000, value: 10 },
        { timestamp: 1640995260000, value: 20 },
        { timestamp: 1640995320000, value: 30 },
      ];

      const result = processTimeSeriesData(data);

      expect(result.labels).toHaveLength(3);
      expect(result.data).toEqual([10, 20, 30]);
    });

    it("should handle empty data", () => {
      const result = processTimeSeriesData([]);
      expect(result.labels).toEqual([]);
      expect(result.data).toEqual([]);
    });
  });

  describe("aggregateByInterval", () => {
    it("should aggregate data by time interval", () => {
      const data = [
        { timestamp: 1640995200000, value: 10 }, // 2022-01-01 00:00:00
        { timestamp: 1640995260000, value: 20 }, // 2022-01-01 00:01:00
        { timestamp: 1640995320000, value: 30 }, // 2022-01-01 00:02:00
      ];

      const result = aggregateByInterval(data, 60000); // 1 minute interval

      expect(result).toHaveLength(3);
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(20);
      expect(result[2].value).toBe(30);
    });

    it("should handle empty data", () => {
      const result = aggregateByInterval([], 60000);
      expect(result).toEqual([]);
    });
  });

  describe("calculateDimensions", () => {
    it("should calculate dimensions based on container", () => {
      const mockContainer = {
        clientWidth: 800,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer, 2);

      expect(result.width).toBe(800);
      expect(result.height).toBe(400);
    });

    it("should use minimum width when container is too small", () => {
      const mockContainer = {
        clientWidth: 200,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer, 2);

      expect(result.width).toBe(300);
      expect(result.height).toBe(200); // max(300/2, 200) = 200
    });

    it("should use minimum height when calculated height is too small", () => {
      const mockContainer = {
        clientWidth: 100,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer, 2);

      expect(result.width).toBe(300);
      expect(result.height).toBe(200);
    });

    it("should use default aspect ratio", () => {
      const mockContainer = {
        clientWidth: 600,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer);

      expect(result.width).toBe(600);
      expect(result.height).toBe(300);
    });

    it("should handle custom aspect ratio", () => {
      const mockContainer = {
        clientWidth: 600,
      } as HTMLElement;

      const result = calculateDimensions(mockContainer, 3);

      expect(result.width).toBe(600);
      expect(result.height).toBe(200);
    });
  });

  describe("getDefaultConfig", () => {
    it("should return default config for line chart", () => {
      const config = getDefaultConfig("line");

      expect(config).toBeDefined();
      expect(config.responsive).toBe(true);
      expect(config.maintainAspectRatio).toBe(false);
    });

    it("should return default config for bar chart", () => {
      const config = getDefaultConfig("bar");

      expect(config).toBeDefined();
      expect(config.responsive).toBe(true);
      expect(config.maintainAspectRatio).toBe(false);
    });

    it("should return default config for pie chart", () => {
      const config = getDefaultConfig("pie");

      expect(config).toBeDefined();
      expect(config.responsive).toBe(true);
      expect(config.maintainAspectRatio).toBe(false);
    });

    it("should return default config for doughnut chart", () => {
      const config = getDefaultConfig("doughnut");

      expect(config).toBeDefined();
      expect(config.responsive).toBe(true);
      expect(config.maintainAspectRatio).toBe(false);
    });

    it("should return default config for unknown chart type", () => {
      const config = getDefaultConfig("unknown" as any);

      expect(config).toBeDefined();
      expect(config.responsive).toBe(true);
      expect(config.maintainAspectRatio).toBe(false);
    });
  });

  describe("applyTheme", () => {
    it("should return default theme when no theme provided", () => {
      const result = applyTheme();

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.background).toBeDefined();
      expect(result.grid).toBeDefined();
    });

    it("should merge provided theme with default theme", () => {
      const customTheme = {
        text: "#ffffff",
        background: "#1a1a1a",
      };

      const result = applyTheme(customTheme);

      expect(result.text).toBe("#ffffff");
      expect(result.background).toBe("#1a1a1a");
      expect(result.grid).toBeDefined(); // Should have default grid value
    });

    it("should handle partial theme", () => {
      const partialTheme = {
        text: "#ff0000",
      };

      const result = applyTheme(partialTheme);

      expect(result.text).toBe("#ff0000");
      expect(result.background).toBeDefined();
      expect(result.grid).toBeDefined();
    });

    it("should handle empty theme object", () => {
      const result = applyTheme({});

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.background).toBeDefined();
      expect(result.grid).toBeDefined();
    });
  });
});
