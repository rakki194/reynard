import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { TimeSeriesChart } from "../components/TimeSeriesChart";

describe("TimeSeriesChart Component", () => {
  const mockTimeSeriesData = [
    { timestamp: 1640995200000, value: 10, label: "Point 1" },
    { timestamp: 1640995260000, value: 20, label: "Point 2" },
    { timestamp: 1640995320000, value: 30, label: "Point 3" },
  ];

  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should render time series chart with title", () => {
      render(() => (
        <TimeSeriesChart
          data={mockTimeSeriesData}
          title="Test Time Series Chart"
        />
      ));

      expect(screen.getByText("Test Time Series Chart")).toBeInTheDocument();
      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should render without title", () => {
      render(() => <TimeSeriesChart data={mockTimeSeriesData} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading state", () => {
      render(() => (
        <TimeSeriesChart data={mockTimeSeriesData} loading={true} />
      ));

      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
      expect(
        screen.queryByTestId("timeseries-chart-canvas"),
      ).not.toBeInTheDocument();
    });

    it("should hide loading state when not loading", () => {
      render(() => (
        <TimeSeriesChart data={mockTimeSeriesData} loading={false} />
      ));

      expect(screen.queryByText("Loading chart...")).not.toBeInTheDocument();
      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should show empty message when no data", () => {
      render(() => (
        <TimeSeriesChart
          data={[]}
          emptyMessage="No time series data available"
        />
      ));

      expect(
        screen.getByText("No time series data available"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("timeseries-chart-canvas"),
      ).not.toBeInTheDocument();
    });

    it("should show custom empty message", () => {
      render(() => (
        <TimeSeriesChart data={[]} emptyMessage="Custom empty message" />
      ));

      expect(screen.getByText("Custom empty message")).toBeInTheDocument();
    });
  });

  describe("Data Handling", () => {
    it("should handle single data point", () => {
      render(() => (
        <TimeSeriesChart data={[{ timestamp: 1640995200000, value: 10 }]} />
      ));

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle large datasets", () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: 1640995200000 + i * 60000, // 1 minute intervals
        value: Math.random() * 100,
        label: `Point ${i + 1}`,
      }));

      render(() => <TimeSeriesChart data={largeData} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle data without labels", () => {
      const dataWithoutLabels = [
        { timestamp: 1640995200000, value: 10 },
        { timestamp: 1640995260000, value: 20 },
        { timestamp: 1640995320000, value: 30 },
      ];

      render(() => <TimeSeriesChart data={dataWithoutLabels} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle zero values", () => {
      const dataWithZeros = [
        { timestamp: 1640995200000, value: 0 },
        { timestamp: 1640995260000, value: 10 },
        { timestamp: 1640995320000, value: 0 },
      ];

      render(() => <TimeSeriesChart data={dataWithZeros} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle negative values", () => {
      const dataWithNegatives = [
        { timestamp: 1640995200000, value: -10 },
        { timestamp: 1640995260000, value: 20 },
        { timestamp: 1640995320000, value: -5 },
      ];

      render(() => <TimeSeriesChart data={dataWithNegatives} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should apply responsive classes when responsive is true", () => {
      render(() => (
        <TimeSeriesChart data={mockTimeSeriesData} responsive={true} />
      ));

      const container = screen
        .getByTestId("timeseries-chart-canvas")
        .closest("div")?.parentElement;
      expect(container).toHaveClass("responsive");
    });

    it("should apply fixed size classes when responsive is false", () => {
      render(() => (
        <TimeSeriesChart data={mockTimeSeriesData} responsive={false} />
      ));

      const container = screen
        .getByTestId("timeseries-chart-canvas")
        .closest("div")?.parentElement;
      expect(container).toHaveClass("fixed-size");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label", () => {
      render(() => (
        <TimeSeriesChart
          data={mockTimeSeriesData}
          title="Accessible Time Series Chart"
        />
      ));

      const container = screen
        .getByTestId("timeseries-chart-canvas")
        .closest("div")?.parentElement;
      expect(container).toHaveAttribute("role", "img");
      expect(container).toHaveAttribute(
        "aria-label",
        "Accessible Time Series Chart",
      );
    });

    it("should have default ARIA label when no title", () => {
      render(() => <TimeSeriesChart data={mockTimeSeriesData} />);

      const container = screen
        .getByTestId("timeseries-chart-canvas")
        .closest("div")?.parentElement;
      expect(container).toHaveAttribute("aria-label", "time series chart");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom class", () => {
      render(() => (
        <TimeSeriesChart
          data={mockTimeSeriesData}
          class="custom-timeseries-chart"
        />
      ));

      const container = screen
        .getByTestId("timeseries-chart-canvas")
        .closest("div")?.parentElement;
      expect(container).toHaveClass("custom-timeseries-chart");
    });

    it("should apply custom width and height", () => {
      render(() => (
        <TimeSeriesChart data={mockTimeSeriesData} width={600} height={400} />
      ));

      const canvas = screen.getByTestId("timeseries-chart-canvas");
      expect(canvas).toHaveAttribute("width", "600");
      expect(canvas).toHaveAttribute("height", "400");
    });

    it("should apply stepped line class when stepped is true", () => {
      render(() => (
        <TimeSeriesChart data={mockTimeSeriesData} stepped={true} />
      ));

      const container = screen
        .getByTestId("timeseries-chart-canvas")
        .closest("div")?.parentElement;
      expect(container).toHaveClass("reynard-timeseries-chart--stepped");
    });
  });

  describe("Configuration Options", () => {
    it("should handle custom max data points", () => {
      const largeData = Array.from({ length: 200 }, (_, i) => ({
        timestamp: 1640995200000 + i * 60000,
        value: Math.random() * 100,
      }));

      render(() => <TimeSeriesChart data={largeData} maxDataPoints={50} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle custom update interval", () => {
      render(() => (
        <TimeSeriesChart data={mockTimeSeriesData} updateInterval={5000} />
      ));

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle custom time range", () => {
      render(() => (
        <TimeSeriesChart
          data={mockTimeSeriesData}
          timeRange={3600000} // 1 hour
        />
      ));

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle unsorted timestamps", () => {
      const unsortedData = [
        { timestamp: 1640995320000, value: 30 },
        { timestamp: 1640995200000, value: 10 },
        { timestamp: 1640995260000, value: 20 },
      ];

      render(() => <TimeSeriesChart data={unsortedData} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle duplicate timestamps", () => {
      const duplicateData = [
        { timestamp: 1640995200000, value: 10 },
        { timestamp: 1640995200000, value: 20 },
        { timestamp: 1640995260000, value: 30 },
      ];

      render(() => <TimeSeriesChart data={duplicateData} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle very old timestamps", () => {
      const oldData = [
        { timestamp: 1000000000000, value: 10 }, // Very old timestamp
        { timestamp: 1640995200000, value: 20 },
        { timestamp: 1640995260000, value: 30 },
      ];

      render(() => <TimeSeriesChart data={oldData} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });

    it("should handle future timestamps", () => {
      const futureData = [
        { timestamp: 1640995200000, value: 10 },
        { timestamp: 1640995260000, value: 20 },
        { timestamp: 2000000000000, value: 30 }, // Future timestamp
      ];

      render(() => <TimeSeriesChart data={futureData} />);

      expect(screen.getByTestId("timeseries-chart-canvas")).toBeInTheDocument();
    });
  });
});
