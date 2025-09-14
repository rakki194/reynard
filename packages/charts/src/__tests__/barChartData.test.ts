import { describe, it, expect } from "vitest";
import {
  processBarChartData,
  BarChartData,
  BarChartDataOptions,
} from "../utils/barChartData";
import type { Dataset } from "../types";

describe("Bar Chart Data Processing", () => {
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

  const validOptions: BarChartDataOptions = {
    labels: mockLabels,
    datasets: mockDatasets,
  };

  describe("processBarChartData", () => {
    it("should process valid bar chart data", () => {
      const result = processBarChartData(validOptions);

      expect(result).not.toBeNull();
      expect(result?.labels).toEqual(mockLabels);
      expect(result?.datasets).toHaveLength(2);
      expect(result?.datasets[0].label).toBe("Dataset 1");
      expect(result?.datasets[1].label).toBe("Dataset 2");
    });

    it("should return null for missing labels", () => {
      const options: BarChartDataOptions = {
        labels: null as any,
        datasets: mockDatasets,
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should return null for missing datasets", () => {
      const options: BarChartDataOptions = {
        labels: mockLabels,
        datasets: null as any,
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should return null for undefined labels", () => {
      const options: BarChartDataOptions = {
        labels: undefined as any,
        datasets: mockDatasets,
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should return null for undefined datasets", () => {
      const options: BarChartDataOptions = {
        labels: mockLabels,
        datasets: undefined as any,
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should return null for invalid chart data", () => {
      const invalidDatasets: Dataset[] = [
        {
          label: "Invalid Dataset",
          data: [10, 20], // Mismatched length with labels
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      const options: BarChartDataOptions = {
        labels: mockLabels, // 3 labels
        datasets: invalidDatasets, // but only 2 data points
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should return null for empty datasets array", () => {
      const options: BarChartDataOptions = {
        labels: mockLabels,
        datasets: [],
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should return null for empty labels array", () => {
      const options: BarChartDataOptions = {
        labels: [],
        datasets: mockDatasets,
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should process datasets with missing optional properties", () => {
      const minimalDatasets: Partial<Dataset>[] = [
        {
          label: "Minimal Dataset 1",
          data: [10, 20, 30],
        },
        {
          label: "Minimal Dataset 2",
          data: [15, 25, 35],
        },
      ];

      const options: BarChartDataOptions = {
        labels: mockLabels,
        datasets: minimalDatasets as Dataset[],
      };

      const result = processBarChartData(options);

      expect(result).not.toBeNull();
      expect(result?.datasets).toHaveLength(2);
      expect(result?.datasets[0].label).toBe("Minimal Dataset 1");
      expect(result?.datasets[0].backgroundColor).toBeDefined();
      expect(result?.datasets[0].borderColor).toBeDefined();
      expect(result?.datasets[0].borderWidth).toBe(2);
    });

    it("should process single dataset", () => {
      const singleDataset: Dataset[] = [
        {
          label: "Single Dataset",
          data: [10, 20, 30],
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      const options: BarChartDataOptions = {
        labels: mockLabels,
        datasets: singleDataset,
      };

      const result = processBarChartData(options);

      expect(result).not.toBeNull();
      expect(result?.datasets).toHaveLength(1);
      expect(result?.datasets[0].label).toBe("Single Dataset");
    });

    it("should preserve original labels", () => {
      const customLabels = ["Custom 1", "Custom 2", "Custom 3"];
      const options: BarChartDataOptions = {
        labels: customLabels,
        datasets: mockDatasets,
      };

      const result = processBarChartData(options);

      expect(result?.labels).toEqual(customLabels);
    });

    it("should handle datasets with different data lengths", () => {
      const mixedDatasets: Dataset[] = [
        {
          label: "Dataset 1",
          data: [10, 20, 30],
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
        {
          label: "Dataset 2",
          data: [15, 25, 35, 45], // Different length
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
        },
      ];

      const options: BarChartDataOptions = {
        labels: mockLabels, // 3 labels
        datasets: mixedDatasets, // but second dataset has 4 data points
      };

      const result = processBarChartData(options);
      expect(result).toBeNull();
    });

    it("should handle large datasets", () => {
      const largeLabels = Array.from(
        { length: 100 },
        (_, i) => `Label ${i + 1}`,
      );
      const largeDatasets: Dataset[] = [
        {
          label: "Large Dataset",
          data: Array.from({ length: 100 }, (_, i) => i + 1),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      const options: BarChartDataOptions = {
        labels: largeLabels,
        datasets: largeDatasets,
      };

      const result = processBarChartData(options);

      expect(result).not.toBeNull();
      expect(result?.labels).toHaveLength(100);
      expect(result?.datasets[0].data).toHaveLength(100);
    });

    it("should handle datasets with zero values", () => {
      const zeroDatasets: Dataset[] = [
        {
          label: "Zero Dataset",
          data: [0, 0, 0],
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      const options: BarChartDataOptions = {
        labels: mockLabels,
        datasets: zeroDatasets,
      };

      const result = processBarChartData(options);

      expect(result).not.toBeNull();
      expect(result?.datasets[0].data).toEqual([0, 0, 0]);
    });

    it("should handle datasets with negative values", () => {
      const negativeDatasets: Dataset[] = [
        {
          label: "Negative Dataset",
          data: [-10, -5, 0, 5, 10],
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      const negativeLabels = ["Neg 1", "Neg 2", "Zero", "Pos 1", "Pos 2"];

      const options: BarChartDataOptions = {
        labels: negativeLabels,
        datasets: negativeDatasets,
      };

      const result = processBarChartData(options);

      expect(result).not.toBeNull();
      expect(result?.datasets[0].data).toEqual([-10, -5, 0, 5, 10]);
    });
  });
});
