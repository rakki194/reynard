import { describe, it, expect } from "vitest";
import { getDefaultChartOptions, enhanceChartOptions, ChartTheme, ChartOptionsConfig } from "../utils/chartOptions";

describe("Chart Options", () => {
  const mockTheme: ChartTheme = {
    text: "#ffffff",
    background: "#1a1a1a",
    grid: "#333333",
  };

  const baseConfig: ChartOptionsConfig = {
    type: "line",
    theme: mockTheme,
    showLegend: true,
    showGrid: true,
    title: "Test Chart",
    xAxisLabel: "X Axis",
    yAxisLabel: "Y Axis",
  };

  describe("getDefaultChartOptions", () => {
    it("should create line chart options", () => {
      const options = getDefaultChartOptions(baseConfig);

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.plugins?.legend?.display).toBe(true);
      expect(options.plugins?.legend?.labels?.color).toBe("#ffffff");
      expect(options.plugins?.tooltip?.backgroundColor).toBe("#1a1a1a");
      expect(options.plugins?.tooltip?.titleColor).toBe("#ffffff");
      expect(options.elements?.line?.tension).toBe(0.4);
      expect(options.elements?.point?.radius).toBe(4);
      expect(options.scales?.x?.grid?.display).toBe(true);
      expect(options.scales?.x?.grid?.color).toBe("#333333");
      expect(options.scales?.x?.title?.display).toBe(true);
      expect(options.scales?.x?.title?.text).toBe("X Axis");
      expect(options.scales?.y?.title?.display).toBe(true);
      expect(options.scales?.y?.title?.text).toBe("Y Axis");
    });

    it("should create bar chart options", () => {
      const config: ChartOptionsConfig = {
        ...baseConfig,
        type: "bar",
      };

      const options = getDefaultChartOptions(config);

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.plugins?.legend?.display).toBe(true);
      expect(options.scales?.x?.grid?.display).toBe(false);
      expect(options.scales?.y?.grid?.display).toBe(true);
      expect(options.scales?.y?.beginAtZero).toBe(true);
      expect(options.scales?.x?.title?.text).toBe("X Axis");
      expect(options.scales?.y?.title?.text).toBe("Y Axis");
    });

    it("should create pie chart options", () => {
      const config: ChartOptionsConfig = {
        ...baseConfig,
        type: "pie",
      };

      const options = getDefaultChartOptions(config);

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.plugins?.legend?.display).toBe(true);
      expect(options.plugins?.legend?.position).toBe("right");
      expect(options.scales).toBeUndefined();
    });

    it("should create doughnut chart options", () => {
      const config: ChartOptionsConfig = {
        ...baseConfig,
        type: "doughnut",
      };

      const options = getDefaultChartOptions(config);

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.plugins?.legend?.display).toBe(true);
      expect(options.plugins?.legend?.position).toBe("right");
      expect(options.scales).toBeUndefined();
    });

    it("should handle unknown chart type", () => {
      const config: ChartOptionsConfig = {
        ...baseConfig,
        type: "unknown" as any,
      };

      const options = getDefaultChartOptions(config);

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.plugins?.legend?.display).toBe(true);
      expect(options.scales).toBeUndefined();
    });

    it("should handle missing optional parameters", () => {
      const config: ChartOptionsConfig = {
        type: "line",
        theme: mockTheme,
      };

      const options = getDefaultChartOptions(config);

      expect(options.plugins?.legend?.display).toBe(true);
      expect(options.scales?.x?.grid?.display).toBe(true);
      expect(options.scales?.x?.title?.display).toBe(false);
      expect(options.scales?.y?.title?.display).toBe(false);
    });

    it("should handle showLegend false", () => {
      const config: ChartOptionsConfig = {
        ...baseConfig,
        showLegend: false,
      };

      const options = getDefaultChartOptions(config);

      expect(options.plugins?.legend?.display).toBe(false);
    });

    it("should handle showGrid false", () => {
      const config: ChartOptionsConfig = {
        ...baseConfig,
        showGrid: false,
      };

      const options = getDefaultChartOptions(config);

      expect(options.scales?.x?.grid?.display).toBe(false);
      expect(options.scales?.y?.grid?.display).toBe(false);
    });

    it("should handle empty axis labels", () => {
      const config: ChartOptionsConfig = {
        ...baseConfig,
        xAxisLabel: "",
        yAxisLabel: "",
      };

      const options = getDefaultChartOptions(config);

      expect(options.scales?.x?.title?.display).toBe(false);
      expect(options.scales?.x?.title?.text).toBe("");
      expect(options.scales?.y?.title?.display).toBe(false);
      expect(options.scales?.y?.title?.text).toBe("");
    });

    it("should apply theme colors correctly", () => {
      const customTheme: ChartTheme = {
        text: "#ff0000",
        background: "#00ff00",
        grid: "#0000ff",
      };

      const config: ChartOptionsConfig = {
        ...baseConfig,
        theme: customTheme,
      };

      const options = getDefaultChartOptions(config);

      expect(options.plugins?.legend?.labels?.color).toBe("#ff0000");
      expect(options.plugins?.tooltip?.backgroundColor).toBe("#00ff00");
      expect(options.plugins?.tooltip?.titleColor).toBe("#ff0000");
      expect(options.plugins?.tooltip?.bodyColor).toBe("#ff0000");
      expect(options.plugins?.tooltip?.borderColor).toBe("#0000ff");
      expect(options.scales?.x?.grid?.color).toBe("#0000ff");
      expect(options.scales?.x?.ticks?.color).toBe("#ff0000");
      expect(options.scales?.y?.grid?.color).toBe("#0000ff");
      expect(options.scales?.y?.ticks?.color).toBe("#ff0000");
    });
  });

  describe("enhanceChartOptions", () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#ffffff",
          },
        },
        tooltip: {
          backgroundColor: "#1a1a1a",
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: "#333333",
          },
          title: {
            display: false,
            text: "",
          },
        },
        y: {
          grid: {
            display: true,
            color: "#333333",
          },
          title: {
            display: false,
            text: "",
          },
        },
      },
    };

    it("should enhance options with title", () => {
      const config = {
        title: "Enhanced Chart",
        showLegend: true,
        showGrid: true,
        xAxisLabel: "Enhanced X",
        yAxisLabel: "Enhanced Y",
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.plugins?.title?.display).toBe(true);
      expect(result.plugins?.title?.text).toBe("Enhanced Chart");
      expect(result.plugins?.title?.font?.size).toBe(16);
      expect(result.plugins?.title?.font?.weight).toBe("bold");
    });

    it("should enhance options without title", () => {
      const config = {
        showLegend: true,
        showGrid: true,
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.plugins?.title?.display).toBe(false);
      expect(result.plugins?.title?.text).toBe("");
    });

    it("should enhance options with axis labels", () => {
      const config = {
        xAxisLabel: "Enhanced X Axis",
        yAxisLabel: "Enhanced Y Axis",
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.scales?.x?.title?.display).toBe(true);
      expect(result.scales?.x?.title?.text).toBe("Enhanced X Axis");
      expect(result.scales?.y?.title?.display).toBe(true);
      expect(result.scales?.y?.title?.text).toBe("Enhanced Y Axis");
    });

    it("should enhance options with showLegend false", () => {
      const config = {
        showLegend: false,
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.plugins?.legend?.display).toBe(false);
    });

    it("should enhance options with showGrid false", () => {
      const config = {
        showGrid: false,
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.scales?.x?.grid?.display).toBe(false);
      expect(result.scales?.y?.grid?.display).toBe(false);
    });

    it("should disable animations", () => {
      const config = {
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.animation?.duration).toBe(0);
    });

    it("should handle pie chart type", () => {
      const config = {
        title: "Pie Chart",
        type: "pie" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.plugins?.title?.display).toBe(true);
      expect(result.plugins?.title?.text).toBe("Pie Chart");
      expect(result.scales).toBeUndefined();
    });

    it("should handle doughnut chart type", () => {
      const config = {
        title: "Doughnut Chart",
        type: "doughnut" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.plugins?.title?.display).toBe(true);
      expect(result.plugins?.title?.text).toBe("Doughnut Chart");
      expect(result.scales).toBeUndefined();
    });

    it("should preserve existing options", () => {
      const config = {
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.responsive).toBe(true);
      expect(result.maintainAspectRatio).toBe(false);
      expect(result.plugins?.tooltip?.backgroundColor).toBe("#1a1a1a");
    });

    it("should handle missing scales in base options", () => {
      const baseOptionsWithoutScales = {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
      };

      const config = {
        xAxisLabel: "X Axis",
        yAxisLabel: "Y Axis",
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptionsWithoutScales, config);

      expect(result.scales?.x?.title?.display).toBe(true);
      expect(result.scales?.x?.title?.text).toBe("X Axis");
      expect(result.scales?.y?.title?.display).toBe(true);
      expect(result.scales?.y?.title?.text).toBe("Y Axis");
    });

    it("should handle empty axis labels", () => {
      const config = {
        xAxisLabel: "",
        yAxisLabel: "",
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.scales?.x?.title?.display).toBe(false);
      expect(result.scales?.x?.title?.text).toBe("");
      expect(result.scales?.y?.title?.display).toBe(false);
      expect(result.scales?.y?.title?.text).toBe("");
    });

    it("should handle showGrid undefined", () => {
      const config = {
        showGrid: undefined,
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.scales?.x?.grid?.display).toBe(true); // Should preserve existing
      expect(result.scales?.y?.grid?.display).toBe(true); // Should preserve existing
    });

    it("should handle showLegend undefined", () => {
      const config = {
        showLegend: undefined,
        type: "line" as const,
      };

      const result = enhanceChartOptions(baseOptions, config);

      expect(result.plugins?.legend?.display).toBe(true); // Should preserve existing
    });
  });
});
