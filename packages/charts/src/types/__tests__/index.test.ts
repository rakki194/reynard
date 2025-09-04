import { describe, it, expect } from "vitest";
import type {
  Dataset,
  ChartConfig,
  AxisConfig,
  ColorConfig,
  AnimationConfig,
  TooltipConfig,
} from "../index";

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
          mode: "index",
        },
      };

      expect(config.title).toBe("Test Chart");
      expect(config.colors).toEqual(["#FF6384", "#36A2EB", "#FFCE56"]);
      expect(config.animation?.duration).toBe(1000);
      expect(config.tooltip?.enabled).toBe(true);
    });
  });

  describe("AxisConfig", () => {
    it("has required properties", () => {
      const axisConfig: AxisConfig = {
        type: "linear",
        display: true,
        position: "left",
      };

      expect(axisConfig.type).toBe("linear");
      expect(axisConfig.display).toBe(true);
      expect(axisConfig.position).toBe("left");
    });

    it("allows optional properties", () => {
      const axisConfig: AxisConfig = {
        type: "time",
        display: true,
        position: "bottom",
        title: {
          display: true,
          text: "Time",
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      };

      expect(axisConfig.title?.display).toBe(true);
      expect(axisConfig.title?.text).toBe("Time");
      expect(axisConfig.grid?.display).toBe(true);
    });
  });

  describe("ColorConfig", () => {
    it("can be a string array", () => {
      const colors: ColorConfig = ["#FF6384", "#36A2EB", "#FFCE56"];
      expect(colors).toEqual(["#FF6384", "#36A2EB", "#FFCE56"]);
    });

    it("can be a function", () => {
      const colors: ColorConfig = (index: number) => `hsl(${index * 60}, 70%, 50%)`;
      expect(typeof colors).toBe("function");
      expect(colors(0)).toBe("hsl(0, 70%, 50%)");
    });
  });

  describe("AnimationConfig", () => {
    it("has required properties", () => {
      const animation: AnimationConfig = {
        duration: 1000,
        easing: "easeInOutQuart",
      };

      expect(animation.duration).toBe(1000);
      expect(animation.easing).toBe("easeInOutQuart");
    });

    it("allows optional properties", () => {
      const animation: AnimationConfig = {
        duration: 1000,
        easing: "easeInOutQuart",
        delay: 100,
        loop: false,
      };

      expect(animation.delay).toBe(100);
      expect(animation.loop).toBe(false);
    });
  });

  describe("TooltipConfig", () => {
    it("has required properties", () => {
      const tooltip: TooltipConfig = {
        enabled: true,
        mode: "index",
      };

      expect(tooltip.enabled).toBe(true);
      expect(tooltip.mode).toBe("index");
    });

    it("allows optional properties", () => {
      const tooltip: TooltipConfig = {
        enabled: true,
        mode: "index",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#ffffff",
        borderWidth: 1,
      };

      expect(tooltip.backgroundColor).toBe("rgba(0, 0, 0, 0.8)");
      expect(tooltip.titleColor).toBe("#ffffff");
      expect(tooltip.bodyColor).toBe("#ffffff");
      expect(tooltip.borderColor).toBe("#ffffff");
      expect(tooltip.borderWidth).toBe(1);
    });
  });
});
