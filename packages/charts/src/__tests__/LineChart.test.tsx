import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { LineChart } from "../components/LineChart";
import type { Dataset, TimeSeriesDataPoint } from "../types";

// Skip tests that require client-side rendering
// These tests fail due to Chart.js server-side rendering issues
const testDescribe = describe;

testDescribe("LineChart", () => {
  const mockLineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ] as Dataset[],
  };

  const mockTimeSeriesData: TimeSeriesDataPoint[] = [
    { timestamp: new Date("2023-01-01"), value: 100 },
    { timestamp: new Date("2023-01-02"), value: 120 },
    { timestamp: new Date("2023-01-03"), value: 90 },
  ];

  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should render with basic data", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          title="Test Line Chart"
        />
      ));

      expect(screen.getByText("Test Line Chart")).toBeInTheDocument();
      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should render without title", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
      expect(screen.queryByText("Test Line Chart")).not.toBeInTheDocument();
    });

    it("should render with time series data", () => {
      render(() => (
        <LineChart
          timeSeriesData={mockTimeSeriesData}
          title="Time Series Chart"
        />
      ));

      expect(screen.getByText("Time Series Chart")).toBeInTheDocument();
      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Loading and Empty States", () => {
    it("should show loading state", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          loading={true}
        />
      ));

      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
      expect(screen.queryByTestId("line-chart-canvas")).not.toBeInTheDocument();
    });

    it("should show empty state when no data", () => {
      render(() => (
        <LineChart
          labels={[]}
          datasets={[]}
          emptyMessage="No data available"
        />
      ));

      expect(screen.getByText("No data available")).toBeInTheDocument();
      expect(screen.queryByTestId("line-chart-canvas")).not.toBeInTheDocument();
    });

    it("should show empty state when data is invalid", () => {
      render(() => (
        <LineChart
          labels={["A", "B"]}
          datasets={[
            {
              label: "Test",
              data: [1, 2, 3], // Mismatched length
            },
          ]}
          emptyMessage="Invalid data"
        />
      ));

      expect(screen.getByText("Invalid data")).toBeInTheDocument();
      expect(screen.queryByTestId("line-chart-canvas")).not.toBeInTheDocument();
    });

    it("should show empty state when time series data is empty", () => {
      render(() => (
        <LineChart
          timeSeriesData={[]}
          emptyMessage="No time series data"
        />
      ));

      expect(screen.getByText("No time series data")).toBeInTheDocument();
      expect(screen.queryByTestId("line-chart-canvas")).not.toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should apply responsive classes when responsive is true", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          responsive={true}
        />
      ));

      const container = screen.getByTestId("line-chart-canvas").closest("div")?.parentElement?.parentElement;
      expect(container).toHaveClass("responsive");
    });

    it("should apply fixed size classes when responsive is false", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          responsive={false}
          width={400}
          height={300}
        />
      ));

      const container = screen.getByTestId("line-chart-canvas").closest("div")?.parentElement?.parentElement;
      expect(container).toHaveClass("fixed-size");
    });

    it("should apply size classes based on dimensions", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          responsive={false}
          width={300}
          height={200}
        />
      ));

      const container = screen.getByTestId("line-chart-canvas").closest("div")?.parentElement?.parentElement;
      expect(container).toHaveClass("size-small");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          title="Accessible Chart"
        />
      ));

      const container = screen.getByTestId("line-chart-canvas").closest("div")?.parentElement?.parentElement;
      expect(container).toHaveAttribute("role", "img");
      expect(container).toHaveAttribute("aria-label", "Accessible Chart");
    });

    it("should have default aria-label when no title", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
        />
      ));

      const container = screen.getByTestId("line-chart-canvas").closest("div")?.parentElement?.parentElement;
      expect(container).toHaveAttribute("aria-label", "line chart");
    });
  });

  describe("Data Handling", () => {
    it("should handle valid datasets", () => {
      render(() => (
        <LineChart
          labels={["A", "B", "C"]}
          datasets={[
            {
              label: "Dataset 1",
              data: [1, 2, 3],
            },
            {
              label: "Dataset 2",
              data: [4, 5, 6],
            },
          ]}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should handle time series data with maxDataPoints", () => {
      const largeTimeSeriesData: TimeSeriesDataPoint[] = Array.from({ length: 150 }, (_, i) => ({
        timestamp: new Date(2023, 0, i + 1),
        value: Math.random() * 100,
      }));

      render(() => (
        <LineChart
          timeSeriesData={largeTimeSeriesData}
          maxDataPoints={100}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should handle time scale configuration", () => {
      render(() => (
        <LineChart
          timeSeriesData={mockTimeSeriesData}
          useTimeScale={true}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom class", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          class="custom-line-chart"
        />
      ));

      const container = screen.getByTestId("line-chart-canvas").closest("div")?.parentElement?.parentElement;
      expect(container).toHaveClass("custom-line-chart");
    });

    it("should pass through other props", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          data-testid="custom-test-id"
        />
      ));

      const container = screen.getByTestId("line-chart-canvas").closest("div")?.parentElement?.parentElement;
      expect(container).toHaveAttribute("data-testid", "custom-test-id");
    });
  });

  describe("Configuration Options", () => {
    it("should handle axis configuration", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          xAxis={{
            label: "X Axis",
            min: 0,
            max: 10,
          }}
          yAxis={{
            label: "Y Axis",
            min: 0,
            max: 100,
          }}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should handle grid and legend configuration", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          showGrid={false}
          showLegend={false}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should handle theme configuration", () => {
      render(() => (
        <LineChart
          labels={mockLineData.labels}
          datasets={mockLineData.datasets}
          theme="dark"
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single data point", () => {
      render(() => (
        <LineChart
          labels={["Single"]}
          datasets={[
            {
              label: "Single Point",
              data: [42],
            },
          ]}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should handle zero values", () => {
      render(() => (
        <LineChart
          labels={["Zero", "One", "Two"]}
          datasets={[
            {
              label: "Zero Values",
              data: [0, 0, 0],
            },
          ]}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should handle negative values", () => {
      render(() => (
        <LineChart
          labels={["Neg", "Pos", "Zero"]}
          datasets={[
            {
              label: "Mixed Values",
              data: [-10, 20, 0],
            },
          ]}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });

    it("should handle very large numbers", () => {
      render(() => (
        <LineChart
          labels={["Large1", "Large2", "Large3"]}
          datasets={[
            {
              label: "Large Numbers",
              data: [1e6, 2e6, 3e6],
            },
          ]}
        />
      ));

      expect(screen.getByTestId("line-chart-canvas")).toBeInTheDocument();
    });
  });
});