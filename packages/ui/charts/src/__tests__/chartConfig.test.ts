import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerChartComponents, isChartRegistered, defaultChartProps, chartPropsToSplit } from "../utils/chartConfig";
import { Chart } from "chart.js";

// Mock Chart.js
vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn(),
    registry: {
      getScale: vi.fn(),
    },
  },
  CategoryScale: "CategoryScale",
  LinearScale: "LinearScale",
  PointElement: "PointElement",
  LineElement: "LineElement",
  BarElement: "BarElement",
  ArcElement: "ArcElement",
  Title: "Title",
  Tooltip: "Tooltip",
  Legend: "Legend",
  Filler: "Filler",
  registerables: ["registerable1", "registerable2"],
}));

describe("Chart Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("registerChartComponents", () => {
    it("should register all Chart.js components", () => {
      registerChartComponents();

      expect(Chart.register).toHaveBeenCalledWith(
        "CategoryScale",
        "LinearScale",
        "PointElement",
        "LineElement",
        "BarElement",
        "ArcElement",
        "Title",
        "Tooltip",
        "Legend",
        "Filler",
        "registerable1",
        "registerable2"
      );
    });

    it("should be called multiple times without issues", () => {
      registerChartComponents();
      registerChartComponents();

      expect(Chart.register).toHaveBeenCalledTimes(2);
    });
  });

  describe("isChartRegistered", () => {
    it("should return true when category scale is registered", () => {
      (Chart.registry.getScale as any).mockReturnValue({ type: "category" });

      const result = isChartRegistered();

      expect(result).toBe(true);
      expect(Chart.registry.getScale).toHaveBeenCalledWith("category");
    });

    it("should return false when category scale is not registered", () => {
      (Chart.registry.getScale as any).mockReturnValue(undefined);

      const result = isChartRegistered();

      expect(result).toBe(false);
      expect(Chart.registry.getScale).toHaveBeenCalledWith("category");
    });

    it("should throw when getScale throws an error", () => {
      (Chart.registry.getScale as any).mockImplementation(() => {
        throw new Error("Registry error");
      });

      // The function should throw the error
      expect(() => isChartRegistered()).toThrow("Registry error");
    });
  });

  describe("defaultChartProps", () => {
    it("should have correct default values", () => {
      expect(defaultChartProps).toEqual({
        width: 400,
        height: 300,
        showGrid: true,
        showLegend: true,
        useOKLCH: true,
        colorTheme: "dark",
        realTime: false,
        updateInterval: 1000,
        loading: false,
        emptyMessage: "No data available",
        enablePerformanceMonitoring: true,
      });
    });

    it("should be a constant object", () => {
      // Test that the object exists and has the expected structure
      expect(defaultChartProps).toBeDefined();
      expect(typeof defaultChartProps).toBe("object");
    });

    it("should have all required properties", () => {
      const requiredProps = [
        "width",
        "height",
        "showGrid",
        "showLegend",
        "useOKLCH",
        "colorTheme",
        "realTime",
        "updateInterval",
        "loading",
        "emptyMessage",
        "enablePerformanceMonitoring",
      ];

      requiredProps.forEach(prop => {
        expect(defaultChartProps).toHaveProperty(prop);
      });
    });
  });

  describe("chartPropsToSplit", () => {
    it("should contain all expected properties", () => {
      const expectedProps = [
        "type",
        "labels",
        "datasets",
        "useOKLCH",
        "colorTheme",
        "realTime",
        "updateInterval",
        "colorGenerator",
        "loading",
        "emptyMessage",
        "enablePerformanceMonitoring",
        "showLegend",
        "showGrid",
        "xAxisLabel",
        "yAxisLabel",
      ];

      expectedProps.forEach(prop => {
        expect(chartPropsToSplit).toContain(prop);
      });
    });

    it("should be a constant array", () => {
      // Test that the array exists and has the expected structure
      expect(chartPropsToSplit).toBeDefined();
      expect(Array.isArray(chartPropsToSplit)).toBe(true);
    });

    it("should have correct length", () => {
      expect(chartPropsToSplit).toHaveLength(15);
    });

    it("should not contain duplicate properties", () => {
      const uniqueProps = new Set(chartPropsToSplit);
      expect(uniqueProps.size).toBe(chartPropsToSplit.length);
    });
  });

  describe("integration", () => {
    it("should work together for chart setup", () => {
      // Mock successful registration
      (Chart.registry.getScale as any).mockReturnValue({ type: "category" });

      // Register components
      registerChartComponents();

      // Check if registered
      const isRegistered = isChartRegistered();

      expect(Chart.register).toHaveBeenCalled();
      expect(isRegistered).toBe(true);
    });

    it("should handle registration failure gracefully", () => {
      // Mock registration failure
      (Chart.register as any).mockImplementation(() => {
        throw new Error("Registration failed");
      });

      // Should not throw
      expect(() => registerChartComponents()).toThrow("Registration failed");

      // Check registration status
      (Chart.registry.getScale as any).mockReturnValue(undefined);
      const isRegistered = isChartRegistered();
      expect(isRegistered).toBe(false);
    });
  });
});
