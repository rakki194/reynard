import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  processDatasets,
  createChartData,
  updateChartDataIncremental,
  DataProcessorConfig,
  ColorGenerator,
} from "../utils/chartDataProcessor";
import type { Dataset } from "../types";

describe("Chart Data Processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDatasets: Dataset[] = [
    {
      label: "Dataset 1",
      data: [10, 20, 30],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 2,
    },
    {
      label: "Dataset 2",
      data: [15, 25, 35],
      backgroundColor: "rgba(255, 99, 132, 0.6)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 2,
    },
  ];

  const mockLabels = ["Label 1", "Label 2", "Label 3"];

  const mockColorGenerator: ColorGenerator = {
    generateColors: vi
      .fn()
      .mockReturnValue(["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"]),
  };

  describe("processDatasets", () => {
    it("should process datasets with custom color generator", () => {
      const colorGenerator = vi.fn().mockReturnValue("rgba(100, 200, 300, 1)");
      const datasetsWithoutColors: Dataset[] = [
        {
          label: "Dataset 1",
          data: [10, 20, 30],
        },
        {
          label: "Dataset 2",
          data: [15, 25, 35],
        },
      ];
      const config: DataProcessorConfig = {
        datasets: datasetsWithoutColors,
        useOKLCH: false,
        colorTheme: "light",
        colorGenerator,
        visualization: mockColorGenerator,
      };

      const result = processDatasets(config);

      expect(result).toHaveLength(2);
      expect(colorGenerator).toHaveBeenCalledWith("light", "Dataset 1");
      expect(colorGenerator).toHaveBeenCalledWith("light", "Dataset 2");
      expect(result[0].backgroundColor).toBe("rgba(100, 200, 300, 1)");
      expect(result[0].borderColor).toBe("rgba(100, 200, 300, 1)");
    });

    it("should process datasets with OKLCH color generation", () => {
      const config: DataProcessorConfig = {
        datasets: mockDatasets,
        useOKLCH: true,
        colorTheme: "dark",
        visualization: mockColorGenerator,
      };

      const result = processDatasets(config);

      expect(result).toHaveLength(2);
      expect(mockColorGenerator.generateColors).toHaveBeenCalledWith(2);
      expect(result[0].backgroundColor).toBe("rgba(54, 162, 235, 0.6)");
      expect(result[0].borderColor).toBe("rgba(54, 162, 235, 1)");
    });

    it("should process datasets with default colors when OKLCH is false", () => {
      const config: DataProcessorConfig = {
        datasets: mockDatasets,
        useOKLCH: false,
        colorTheme: "light",
        visualization: mockColorGenerator,
      };

      const result = processDatasets(config);

      expect(result).toHaveLength(2);
      expect(result[0].backgroundColor).toBe("rgba(54, 162, 235, 0.6)");
      expect(result[0].borderColor).toBe("rgba(54, 162, 235, 1)");
      expect(result[1].backgroundColor).toBe("rgba(255, 99, 132, 0.6)");
      expect(result[1].borderColor).toBe("rgba(255, 99, 132, 1)");
    });

    it("should handle datasets with existing colors", () => {
      const datasetsWithColors: Dataset[] = [
        {
          label: "Dataset 1",
          data: [10, 20, 30],
          backgroundColor: "rgba(100, 100, 100, 0.8)",
          borderColor: "rgba(100, 100, 100, 1)",
          borderWidth: 3,
        },
      ];

      const config: DataProcessorConfig = {
        datasets: datasetsWithColors,
        useOKLCH: false,
        colorTheme: "light",
        visualization: mockColorGenerator,
      };

      const result = processDatasets(config);

      expect(result[0].backgroundColor).toBe("rgba(100, 100, 100, 0.8)");
      expect(result[0].borderColor).toBe("rgba(100, 100, 100, 1)");
      expect(result[0].borderWidth).toBe(3);
    });

    it("should set default values for missing properties", () => {
      const minimalDatasets: Dataset[] = [
        {
          label: "Minimal Dataset",
          data: [10, 20, 30],
        },
      ];

      const config: DataProcessorConfig = {
        datasets: minimalDatasets,
        useOKLCH: false,
        colorTheme: "light",
        visualization: mockColorGenerator,
      };

      const result = processDatasets(config);

      expect(result[0].borderWidth).toBe(2);
      expect(result[0].pointBackgroundColor).toBe("rgba(54, 162, 235, 1)");
      expect(result[0].pointBorderColor).toBe("#fff");
      expect(result[0].pointBorderWidth).toBe(1);
      expect(result[0].pointRadius).toBe(4);
      expect(result[0].pointHoverRadius).toBe(6);
      expect(result[0].tension).toBe(0.1);
      expect(result[0].fill).toBe(false);
    });

    it("should handle empty datasets array", () => {
      const config: DataProcessorConfig = {
        datasets: [],
        useOKLCH: false,
        colorTheme: "light",
        visualization: mockColorGenerator,
      };

      const result = processDatasets(config);

      expect(result).toEqual([]);
    });

    it("should handle datasets with more than 6 items using default colors", () => {
      const manyDatasets: Dataset[] = Array.from({ length: 8 }, (_, i) => ({
        label: `Dataset ${i + 1}`,
        data: [10, 20, 30],
      }));

      const config: DataProcessorConfig = {
        datasets: manyDatasets,
        useOKLCH: false,
        colorTheme: "light",
        visualization: mockColorGenerator,
      };

      const result = processDatasets(config);

      expect(result).toHaveLength(8);
      // Should fall back to default color for indices beyond 5
      expect(result[6].backgroundColor).toBe("rgba(54, 162, 235, 0.6)");
      expect(result[7].backgroundColor).toBe("rgba(54, 162, 235, 0.6)");
    });

    it("should handle OKLCH color generation with insufficient colors", () => {
      const limitedColorGenerator: ColorGenerator = {
        generateColors: vi.fn().mockReturnValue(["rgba(54, 162, 235, 1)"]),
      };

      const datasetsWithoutColors: Dataset[] = [
        {
          label: "Dataset 1",
          data: [10, 20, 30],
        },
        {
          label: "Dataset 2",
          data: [15, 25, 35],
        },
      ];

      const config: DataProcessorConfig = {
        datasets: datasetsWithoutColors,
        useOKLCH: true,
        colorTheme: "dark",
        visualization: limitedColorGenerator,
      };

      const result = processDatasets(config);

      expect(result[0].backgroundColor).toBe("rgba(54, 162, 235, 0.6)");
      expect(result[1].backgroundColor).toBe("rgba(54, 162, 235, 0.6)"); // Fallback
    });
  });

  describe("createChartData", () => {
    it("should create chart data object", () => {
      const result = createChartData(mockLabels, mockDatasets);

      expect(result).toEqual({
        labels: mockLabels,
        datasets: mockDatasets,
      });
    });

    it("should handle empty labels and datasets", () => {
      const result = createChartData([], []);

      expect(result).toEqual({
        labels: [],
        datasets: [],
      });
    });

    it("should handle null/undefined inputs", () => {
      const result1 = createChartData(null as any, mockDatasets);
      const result2 = createChartData(mockLabels, null as any);

      expect(result1.labels).toBeNull();
      expect(result1.datasets).toEqual(mockDatasets);
      expect(result2.labels).toEqual(mockLabels);
      expect(result2.datasets).toBeNull();
    });
  });

  describe("updateChartDataIncremental", () => {
    let mockChart: any;

    beforeEach(() => {
      mockChart = {
        data: {
          labels: ["Old Label 1", "Old Label 2"],
          datasets: [
            {
              data: [1, 2],
              label: "Old Dataset 1",
            },
            {
              data: [3, 4],
              label: "Old Dataset 2",
            },
          ],
        },
        update: vi.fn(),
      };
    });

    it("should update chart labels", () => {
      const newLabels = ["New Label 1", "New Label 2", "New Label 3"];

      updateChartDataIncremental(mockChart, newLabels, []);

      expect(mockChart.data.labels).toEqual(newLabels);
      expect(mockChart.update).toHaveBeenCalledWith("none");
    });

    it("should update chart datasets", () => {
      const newDatasets: Dataset[] = [
        {
          label: "New Dataset 1",
          data: [10, 20, 30],
        },
        {
          label: "New Dataset 2",
          data: [40, 50, 60],
        },
      ];

      updateChartDataIncremental(mockChart, [], newDatasets);

      expect(mockChart.data.datasets[0].data).toEqual([10, 20, 30]);
      expect(mockChart.data.datasets[0].label).toBe("New Dataset 1");
      expect(mockChart.data.datasets[1].data).toEqual([40, 50, 60]);
      expect(mockChart.data.datasets[1].label).toBe("New Dataset 2");
      expect(mockChart.update).toHaveBeenCalledWith("none");
    });

    it("should update both labels and datasets", () => {
      const newLabels = ["New Label 1", "New Label 2"];
      const newDatasets: Dataset[] = [
        {
          label: "New Dataset 1",
          data: [10, 20],
        },
      ];

      updateChartDataIncremental(mockChart, newLabels, newDatasets);

      expect(mockChart.data.labels).toEqual(newLabels);
      expect(mockChart.data.datasets[0].data).toEqual([10, 20]);
      expect(mockChart.data.datasets[0].label).toBe("New Dataset 1");
      expect(mockChart.update).toHaveBeenCalledWith("none");
    });

    it("should handle empty labels array", () => {
      updateChartDataIncremental(mockChart, [], mockDatasets);

      // Empty array has length 0, so labels should not be updated
      expect(mockChart.data.labels).toEqual(["Old Label 1", "Old Label 2"]);
      expect(mockChart.update).toHaveBeenCalledWith("none");
    });

    it("should handle empty datasets array", () => {
      updateChartDataIncremental(mockChart, mockLabels, []);

      expect(mockChart.data.datasets).toEqual(mockChart.data.datasets); // Unchanged
      expect(mockChart.update).toHaveBeenCalledWith("none");
    });

    it("should handle null/undefined inputs gracefully", () => {
      updateChartDataIncremental(mockChart, null as any, undefined as any);

      expect(mockChart.data.labels).toEqual(mockChart.data.labels); // Unchanged
      expect(mockChart.data.datasets).toEqual(mockChart.data.datasets); // Unchanged
      expect(mockChart.update).toHaveBeenCalledWith("none");
    });

    it("should handle datasets with more items than existing", () => {
      const newDatasets: Dataset[] = [
        {
          label: "Dataset 1",
          data: [10, 20],
        },
        {
          label: "Dataset 2",
          data: [30, 40],
        },
        {
          label: "Dataset 3",
          data: [50, 60],
        },
      ];

      updateChartDataIncremental(mockChart, [], newDatasets);

      expect(mockChart.data.datasets[0].data).toEqual([10, 20]);
      expect(mockChart.data.datasets[1].data).toEqual([30, 40]);
      // Dataset 3 doesn't exist in mock chart, so it shouldn't be updated
      expect(mockChart.data.datasets[2]).toBeUndefined();
    });

    it("should handle datasets with fewer items than existing", () => {
      const newDatasets: Dataset[] = [
        {
          label: "Only Dataset 1",
          data: [10, 20],
        },
      ];

      updateChartDataIncremental(mockChart, [], newDatasets);

      expect(mockChart.data.datasets[0].data).toEqual([10, 20]);
      expect(mockChart.data.datasets[0].label).toBe("Only Dataset 1");
      // Dataset 2 should remain unchanged
      expect(mockChart.data.datasets[1].data).toEqual([3, 4]);
      expect(mockChart.data.datasets[1].label).toBe("Old Dataset 2");
    });

    it("should handle chart without update method", () => {
      const chartWithoutUpdate = {
        data: {
          labels: ["Label 1"],
          datasets: [{ data: [1], label: "Dataset 1" }],
        },
      };

      expect(() => {
        updateChartDataIncremental(chartWithoutUpdate, ["New Label"], []);
      }).toThrow();
    });
  });
});
