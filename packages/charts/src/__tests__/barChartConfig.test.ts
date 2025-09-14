import { describe, it, expect } from "vitest";
import { createBarChartOptions, BarChartConfigOptions } from "../utils/barChartConfig";

describe("Bar Chart Configuration", () => {
  const defaultOptions: BarChartConfigOptions = {
    showGrid: true,
    showLegend: true,
    responsive: true,
    maintainAspectRatio: false,
    horizontal: false,
    stacked: false,
  };

  describe("createBarChartOptions", () => {
    it("should create basic bar chart options", () => {
      const options = createBarChartOptions(defaultOptions);

      expect(options).toBeDefined();
      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.indexAxis).toBe("x");
    });

    it("should handle horizontal bar charts", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        horizontal: true,
      });

      expect(options.indexAxis).toBe("y");
    });

    it("should handle stacked bar charts", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        stacked: true,
      });

      expect(options.scales?.x?.stacked).toBe(true);
      expect(options.scales?.y?.stacked).toBe(true);
    });

    it("should handle horizontal stacked bar charts", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        horizontal: true,
        stacked: true,
      });

      expect(options.indexAxis).toBe("y");
      expect(options.scales?.x?.stacked).toBe(true);
      expect(options.scales?.y?.stacked).toBe(true);
    });

    it("should configure title when provided", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        title: "Test Chart",
      });

      expect(options.plugins?.title?.display).toBe(true);
      expect(options.plugins?.title?.text).toBe("Test Chart");
    });

    it("should hide title when not provided", () => {
      const options = createBarChartOptions(defaultOptions);

      expect(options.plugins?.title?.display).toBe(false);
    });

    it("should configure legend display", () => {
      const optionsWithLegend = createBarChartOptions({
        ...defaultOptions,
        showLegend: true,
      });

      const optionsWithoutLegend = createBarChartOptions({
        ...defaultOptions,
        showLegend: false,
      });

      expect(optionsWithLegend.plugins?.legend?.display).toBe(true);
      expect(optionsWithoutLegend.plugins?.legend?.display).toBe(false);
    });

    it("should configure grid display", () => {
      const optionsWithGrid = createBarChartOptions({
        ...defaultOptions,
        showGrid: true,
      });

      const optionsWithoutGrid = createBarChartOptions({
        ...defaultOptions,
        showGrid: false,
      });

      expect(optionsWithGrid.scales?.y?.grid?.display).toBe(true);
      expect(optionsWithoutGrid.scales?.y?.grid?.display).toBe(false);
    });

    it("should handle x-axis configuration", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        xAxis: {
          label: "X Axis Label",
          display: true,
          position: "bottom",
          min: 0,
          max: 100,
          ticks: {
            stepSize: 10,
          },
        },
      });

      expect(options.scales?.x?.title?.display).toBe(true);
      expect(options.scales?.x?.title?.text).toBe("X Axis Label");
      expect(options.scales?.x?.ticks?.stepSize).toBe(10);
      // Note: min/max are only applied to value axis, not category axis
    });

    it("should handle y-axis configuration", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        yAxis: {
          label: "Y Axis Label",
          display: true,
          position: "left",
          min: 0,
          max: 50,
          ticks: {
            stepSize: 5,
          },
        },
      });

      expect(options.scales?.y?.title?.display).toBe(true);
      expect(options.scales?.y?.title?.text).toBe("Y Axis Label");
      expect(options.scales?.y?.position).toBe("left");
      expect(options.scales?.y?.min).toBe(0);
      expect(options.scales?.y?.max).toBe(50);
      expect(options.scales?.y?.ticks?.stepSize).toBe(5);
    });

    it("should handle horizontal chart axis configuration", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        horizontal: true,
        xAxis: {
          label: "Value Axis",
          min: 0,
          max: 100,
        },
        yAxis: {
          label: "Category Axis",
        },
      });

      // In horizontal charts, x becomes the value axis and y becomes the category axis
      expect(options.scales?.x?.title?.text).toBe("Value Axis");
      expect(options.scales?.x?.min).toBe(0);
      expect(options.scales?.x?.max).toBe(100);
      expect(options.scales?.y?.title?.text).toBe("Category Axis");
    });

    it("should handle axis display false", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        xAxis: {
          display: false,
        },
        yAxis: {
          display: false,
        },
      });

      expect(options.scales?.x?.display).toBe(false);
      expect(options.scales?.y?.display).toBe(false);
    });

    it("should handle animation configuration", () => {
      const animationConfig = {
        duration: 1000,
        easing: "easeInOutQuart",
      };

      const options = createBarChartOptions({
        ...defaultOptions,
        animation: animationConfig,
      });

      expect(options.animation).toEqual(animationConfig);
    });

    it("should handle tooltip configuration", () => {
      const tooltipConfig = {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      };

      const options = createBarChartOptions({
        ...defaultOptions,
        tooltip: tooltipConfig,
      });

      expect(options.plugins?.tooltip).toEqual(
        expect.objectContaining(tooltipConfig)
      );
    });

    it("should handle theme configuration", () => {
      const theme = {
        primaryColor: "#ff0000",
        secondaryColor: "#00ff00",
      };

      const options = createBarChartOptions({
        ...defaultOptions,
        theme,
      });

      // Note: Theme is not currently applied to the chart options in this implementation
      // This test verifies the function doesn't crash when theme is provided
      expect(options).toBeDefined();
    });

    it("should set beginAtZero to true for value axis", () => {
      const options = createBarChartOptions(defaultOptions);

      expect(options.scales?.y?.beginAtZero).toBe(true);
    });

    it("should set beginAtZero to true for horizontal chart value axis", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        horizontal: true,
      });

      expect(options.scales?.x?.beginAtZero).toBe(true);
    });

    it("should hide grid for category axis", () => {
      const options = createBarChartOptions(defaultOptions);

      expect(options.scales?.x?.grid?.display).toBe(false);
    });

    it("should hide grid for horizontal chart category axis", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        horizontal: true,
      });

      expect(options.scales?.y?.grid?.display).toBe(false);
    });

    it("should set proper axis types", () => {
      const options = createBarChartOptions(defaultOptions);

      expect(options.scales?.x?.type).toBe("category");
      expect(options.scales?.y?.type).toBe("linear");
    });

    it("should set proper axis types for horizontal charts", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        horizontal: true,
      });

      expect(options.scales?.x?.type).toBe("linear");
      expect(options.scales?.y?.type).toBe("category");
    });

    it("should handle missing axis configuration gracefully", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        xAxis: undefined,
        yAxis: undefined,
      });

      expect(options.scales?.x?.display).toBe(true);
      expect(options.scales?.y?.display).toBe(true);
    });

    it("should handle partial axis configuration", () => {
      const options = createBarChartOptions({
        ...defaultOptions,
        xAxis: {
          label: "X Label",
        },
        yAxis: {
          min: 0,
        },
      });

      expect(options.scales?.x?.title?.text).toBe("X Label");
      expect(options.scales?.y?.min).toBe(0);
    });
  });
});
