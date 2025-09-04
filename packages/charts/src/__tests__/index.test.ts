import { describe, it, expect } from "vitest";
import { BarChart, LineChart, PieChart, TimeSeriesChart } from "../components";
import { validateChartData, prepareDatasets, getDefaultConfig } from "../utils";

describe("Package Exports", () => {
  describe("Components", () => {
    it("exports BarChart component", () => {
      expect(BarChart).toBeDefined();
      expect(typeof BarChart).toBe("function");
    });

    it("exports LineChart component", () => {
      expect(LineChart).toBeDefined();
      expect(typeof LineChart).toBe("function");
    });

    it("exports PieChart component", () => {
      expect(PieChart).toBeDefined();
      expect(typeof PieChart).toBe("function");
    });

    it("exports TimeSeriesChart component", () => {
      expect(TimeSeriesChart).toBeDefined();
      expect(typeof TimeSeriesChart).toBe("function");
    });
  });

  describe("Utilities", () => {
    it("exports validateChartData function", () => {
      expect(validateChartData).toBeDefined();
      expect(typeof validateChartData).toBe("function");
    });

    it("exports prepareDatasets function", () => {
      expect(prepareDatasets).toBeDefined();
      expect(typeof prepareDatasets).toBe("function");
    });

    it("exports getDefaultConfig function", () => {
      expect(getDefaultConfig).toBeDefined();
      expect(typeof getDefaultConfig).toBe("function");
    });
  });
});
