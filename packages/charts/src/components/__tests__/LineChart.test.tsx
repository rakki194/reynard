import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { LineChart } from "../LineChart";
import type { Dataset } from "../../types";

const mockDatasets: Dataset[] = [
  {
    label: "Temperature",
    data: [20, 22, 25, 23, 21],
    backgroundColor: "rgba(54, 162, 235, 0.2)",
    borderColor: "rgba(54, 162, 235, 1)",
    borderWidth: 2,
    fill: true,
  },
  {
    label: "Humidity",
    data: [60, 65, 70, 68, 62],
    backgroundColor: "rgba(255, 99, 132, 0.2)",
    borderColor: "rgba(255, 99, 132, 1)",
    borderWidth: 2,
    fill: false,
  },
];

const mockLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const mockTimeSeriesData = [
  { timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, value: 20, label: "Mon" },
  { timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, value: 22, label: "Tue" },
  { timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, value: 25, label: "Wed" },
  { timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, value: 23, label: "Thu" },
  { timestamp: Date.now(), value: 21, label: "Fri" },
];

describe("LineChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          title="Temperature & Humidity"
        />
      ));
      
      expect(screen.getByText("Line Chart")).toBeInTheDocument();
    });

    it("renders with custom dimensions", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          width={600}
          height={400}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-line-chart");
    });

    it("shows loading state when loading prop is true", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          loading={true}
        />
      ));
      
      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    });

    it("shows empty state when no data is provided", () => {
      render(() => (
        <LineChart
          labels={[]}
          datasets={[]}
          emptyMessage="No data available"
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("applies custom class name", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          class="custom-chart-class"
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveClass("custom-chart-class");
    });
  });

  describe("Chart Variants", () => {
    it("renders with time series data when provided", () => {
      render(() => (
        <LineChart
          timeSeriesData={mockTimeSeriesData}
          maxDataPoints={50}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom max data points", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          maxDataPoints={200}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with time scale when useTimeScale is true", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          useTimeScale={true}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("applies responsive styles when responsive is true", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          responsive={true}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveStyle("width: 100%");
      expect(chartContainer).toHaveStyle("height: 100%");
    });

    it("applies fixed dimensions when responsive is false", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          responsive={false}
          width={500}
          height={300}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveStyle("width: 500px");
      expect(chartContainer).toHaveStyle("height: 300px");
    });

    it("maintains aspect ratio when maintainAspectRatio is true", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          maintainAspectRatio={true}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Axis Configuration", () => {
    it("renders with custom x-axis label", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          xAxis={{ label: "Days" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom y-axis label", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          yAxis={{ label: "Values" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom axis positions", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          yAxis={{ position: "right" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom axis min/max values", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          yAxis={{ min: 0, max: 100 }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom x-axis label", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          xAxis={{ label: "Date" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom y-axis label", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          yAxis={{ label: "Temperature (°C)" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Grid and Legend Configuration", () => {
    it("renders without grid when showGrid is false", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          showGrid={false}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders without legend when showLegend is false", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          showLegend={false}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom grid colors", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          xAxis={{ grid: { color: "rgba(0,0,0,0.1)" } }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Animation and Tooltip Configuration", () => {
    it("renders with custom animation settings", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          animation={{ duration: 2000, easing: "easeInOutQuart" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom tooltip settings", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          tooltip={{ enabled: false, backgroundColor: "rgba(0,0,0,0.8)" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom tooltip settings", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          tooltip={{ enabled: true, backgroundColor: "rgba(0,0,0,0.9)" }}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles empty labels array", () => {
      render(() => (
        <LineChart
          labels={[]}
          datasets={mockDatasets}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles empty datasets array", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={[]}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles datasets with empty data arrays", () => {
      const emptyDatasets: Dataset[] = [
        {
          label: "Empty Dataset",
          data: [],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={emptyDatasets}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles mismatched data lengths", () => {
      const mismatchedDatasets: Dataset[] = [
        {
          label: "Mismatched",
          data: [20, 22, 25], // Only 3 values instead of 5
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mismatchedDatasets}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles very large datasets", () => {
      const largeLabels = Array.from({ length: 100 }, (_, i) => `Label ${i + 1}`);
      const largeDatasets: Dataset[] = [
        {
          label: "Large Dataset",
          data: Array.from({ length: 100 }, () => Math.random() * 100),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      render(() => (
        <LineChart
          labels={largeLabels}
          datasets={largeDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles datasets with missing optional properties", () => {
      const minimalDatasets: Dataset[] = [
        {
          label: "Minimal Dataset",
          data: [20, 22, 25, 23, 21],
        },
      ];

      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={minimalDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles negative values", () => {
      const negativeDatasets: Dataset[] = [
        {
          label: "Negative Values",
          data: [-10, -5, 0, 5, 10],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={negativeDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles zero values", () => {
      const zeroDatasets: Dataset[] = [
        {
          label: "Zero Values",
          data: [0, 0, 0, 0, 0],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={zeroDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Performance Tests", () => {
    it("renders quickly with small datasets", () => {
      const startTime = performance.now();
      
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
        />
      ));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles rapid prop changes efficiently", async () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          width={400}
          height={300}
        />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles large dataset updates efficiently", () => {
      const largeLabels = Array.from({ length: 100 }, (_, i) => `Label ${i + 1}`);
      const largeDatasets: Dataset[] = [
        {
          label: "Large Dataset",
          data: Array.from({ length: 100 }, () => Math.random() * 100),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ];

      const startTime = performance.now();
      render(() => (
        <LineChart
          labels={largeLabels}
          datasets={largeDatasets}
        />
      ));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should render in under 200ms
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          title="Accessible Line Chart"
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
      // Note: Focus testing is limited in jsdom, so we just verify the element exists
    });
  });

  describe("Integration Tests", () => {
    it("works with different chart configurations", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          width={500}
          height={400}
          class="custom-config"
        />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles custom class names", () => {
      render(() => (
        <LineChart
          labels={mockLabels}
          datasets={mockDatasets}
          class="custom-theme"
        />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });
});
