import { describe, it, expect } from "vitest";
import type { Dataset, ChartConfig, AxisOptions, ChartTheme } from "../index";

describe("Chart Types", () => {
  describe("Dataset", () => {
    it("has required properties", () => {
      const dataset: Dataset = {
        label: "Test Dataset",
        data: [1, 2, 3, 4, 5],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      };

      expect(dataset.label).toBe("Test Dataset");
      expect(dataset.data).toEqual([1, 2, 3, 4, 5]);
      expect(dataset.backgroundColor).toBe("rgba(54, 162, 235, 0.5)");
      expect(dataset.borderColor).toBe("rgba(54, 162, 235, 1)");
      expect(dataset.borderWidth).toBe(1);
    });

    it("allows optional properties", () => {
      const dataset: Dataset = {
        label: "Test Dataset",
        data: [1, 2, 3],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      };

      expect(dataset.fill).toBe(true);
      expect(dataset.tension).toBe(0.4);
      expect(dataset.pointRadius).toBe(5);
      expect(dataset.pointHoverRadius).toBe(8);
    });
  });

  describe("ChartConfig", () => {
    it("has required properties", () => {
      const config: ChartConfig = {
        width: 400,
        height: 300,
        showGrid: true,
        showLegend: true,
        responsive: true,
        maintainAspectRatio: false,
      };

      expect(config.width).toBe(400);
      expect(config.height).toBe(300);
      expect(config.showGrid).toBe(true);
      expect(config.showLegend).toBe(true);
      expect(config.responsive).toBe(true);
      expect(config.maintainAspectRatio).toBe(false);
    });

    it("allows optional properties", () => {
      const config: ChartConfig = {
        width: 400,
        height: 300,
        showGrid: true,
        showLegend: true,
        responsive: true,
        maintainAspectRatio: false,
        title: "Test Chart",
        colors: ["#FF6384", "#36A2EB", "#FFCE56"],
        animation: {
          duration: 1000,
          easing: "easeInOutQuart",
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        },
      };

      expect(config.title).toBe("Test Chart");
      expect(config.colors).toEqual(["#FF6384", "#36A2EB", "#FFCE56"]);
      expect(config.animation?.duration).toBe(1000);
      expect(config.tooltip?.enabled).toBe(true);
    });
  });

  describe("AxisOptions", () => {
    it("has optional properties", () => {
      const axisOptions: AxisOptions = {
        label: "Time",
        display: true,
        position: "bottom",
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      };

      expect(axisOptions.label).toBe("Time");
      expect(axisOptions.display).toBe(true);
      expect(axisOptions.position).toBe("bottom");
      expect(axisOptions.grid?.display).toBe(true);
    });
  });

  describe("ChartTheme", () => {
    it("has all required properties", () => {
      const theme: ChartTheme = {
        primary: "#FF6384",
        secondary: "#36A2EB",
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#F44336",
        info: "#2196F3",
        background: "#FFFFFF",
        text: "#000000",
        grid: "#E0E0E0",
      };

      expect(theme.primary).toBe("#FF6384");
      expect(theme.secondary).toBe("#36A2EB");
      expect(theme.success).toBe("#4CAF50");
      expect(theme.warning).toBe("#FF9800");
      expect(theme.danger).toBe("#F44336");
      expect(theme.info).toBe("#2196F3");
      expect(theme.background).toBe("#FFFFFF");
      expect(theme.text).toBe("#000000");
      expect(theme.grid).toBe("#E0E0E0");
    });
  });
});
