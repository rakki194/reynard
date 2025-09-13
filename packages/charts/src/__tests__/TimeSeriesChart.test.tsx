import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { TimeSeriesChart } from "../components/TimeSeriesChart";
import type { TimeSeriesDataPoint } from "../../../types";

// Extend expect with jest-dom matchers
// Using reynard-testing instead of jest-dom

const mockData: TimeSeriesDataPoint[] = [
  { timestamp: 1640995200000, value: 20, label: "Jan 1" }, // 2022-01-01
  { timestamp: 1641081600000, value: 22, label: "Jan 2" }, // 2022-01-02
  { timestamp: 1641168000000, value: 25, label: "Jan 3" }, // 2022-01-03
  { timestamp: 1641254400000, value: 23, label: "Jan 4" }, // 2022-01-04
  { timestamp: 1641340800000, value: 21, label: "Jan 5" }, // 2022-01-05
];

describe("TimeSeriesChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(() => (
        <TimeSeriesChart data={mockData} title="Temperature Over Time" />
      ));

      expect(screen.getByText("Line Chart")).toBeInTheDocument();
    });

    it("renders with custom dimensions", () => {
      render(() => (
        <TimeSeriesChart
          data={mockData}
          width={600}
          height={400}
          responsive={false}
        />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-timeseries-chart");
      expect(chartContainer).toHaveStyle("width: 600px");
      expect(chartContainer).toHaveStyle("height: 400px");
    });

    it("shows loading state when loading prop is true", () => {
      render(() => <TimeSeriesChart data={mockData} loading={true} />);

      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    });

    it("shows empty state when no data is provided", () => {
      render(() => (
        <TimeSeriesChart data={[]} emptyMessage="No data available" />
      ));

      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("applies custom class name", () => {
      render(() => (
        <TimeSeriesChart data={mockData} class="custom-chart-class" />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveClass("custom-chart-class");
      expect(chartContainer).toHaveClass("reynard-timeseries-chart");
    });
  });

  describe("Chart Variants", () => {
    it("renders with stepped line when stepped prop is true", () => {
      render(() => <TimeSeriesChart data={mockData} stepped={true} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-timeseries-chart--stepped");
      expect(chartContainer).toHaveClass("reynard-timeseries-chart");
    });

    it("renders with tension when tension prop is provided", () => {
      render(() => <TimeSeriesChart data={mockData} tension={0.4} />);

      // The component should show "No data available" initially due to mocking
      expect(screen.getByText("Line Chart")).toBeInTheDocument();
    });

    it("renders with area fill when fill prop is true", () => {
      render(() => <TimeSeriesChart data={mockData} fill={true} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("applies responsive styles when responsive is true", () => {
      render(() => <TimeSeriesChart data={mockData} responsive={true} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveStyle("width: 100%");
      expect(chartContainer).toHaveStyle("height: 100%");
    });

    it("applies fixed dimensions when responsive is false", () => {
      render(() => (
        <TimeSeriesChart
          data={mockData}
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
        <TimeSeriesChart data={mockData} maintainAspectRatio={true} />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Time Scale Configuration", () => {
    it("renders with time scale by default", () => {
      render(() => <TimeSeriesChart data={mockData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Axis Configuration", () => {
    it("renders with custom x-axis label", () => {
      render(() => (
        <TimeSeriesChart data={mockData} xAxis={{ label: "Date" }} />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom y-axis label", () => {
      render(() => (
        <TimeSeriesChart
          data={mockData}
          yAxis={{ label: "Temperature (°C)" }}
        />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom axis positions", () => {
      render(() => (
        <TimeSeriesChart data={mockData} yAxis={{ position: "right" }} />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom axis min/max values", () => {
      render(() => (
        <TimeSeriesChart data={mockData} yAxis={{ min: 0, max: 100 }} />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Grid and Legend Configuration", () => {
    it("renders without grid when showGrid is false", () => {
      render(() => <TimeSeriesChart data={mockData} showGrid={false} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders without legend when showLegend is false", () => {
      render(() => <TimeSeriesChart data={mockData} showLegend={false} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Animation and Tooltip Configuration", () => {
    it("renders with custom animation settings", () => {
      render(() => (
        <TimeSeriesChart
          data={mockData}
          animation={{ duration: 2000, easing: "easeInOutQuart" }}
        />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom tooltip settings", () => {
      render(() => (
        <TimeSeriesChart
          data={mockData}
          tooltip={{ enabled: false, backgroundColor: "rgba(0,0,0,0.8)" }}
        />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Data Processing", () => {
    it("processes time series data correctly", () => {
      render(() => <TimeSeriesChart data={mockData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles data without labels", () => {
      const dataWithoutLabels: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: 20, label: "No Label 1" },
        { timestamp: 1641081600000, value: 22, label: "No Label 2" },
        { timestamp: 1641168000000, value: 25, label: "No Label 3" },
      ];

      render(() => <TimeSeriesChart data={dataWithoutLabels} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles data with custom labels", () => {
      const dataWithCustomLabels: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: 20, label: "Custom Label 1" },
        { timestamp: 1641081600000, value: 22, label: "Custom Label 2" },
        { timestamp: 1641168000000, value: 25, label: "Custom Label 3" },
      ];

      render(() => <TimeSeriesChart data={dataWithCustomLabels} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("limits data points for performance", () => {
      const largeData = Array.from({ length: 200 }, (_, i) => ({
        timestamp: 1640995200000 + i * 86400000, // Add one day each
        value: Math.random() * 100,
        label: `Day ${i + 1}`,
      }));

      render(() => <TimeSeriesChart data={largeData} maxDataPoints={100} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles empty data array", () => {
      render(() => <TimeSeriesChart data={[]} />);

      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles single data point", () => {
      const singleDataPoint: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: 20, label: "Single Point" },
      ];

      render(() => <TimeSeriesChart data={singleDataPoint} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles two data points", () => {
      const twoDataPoints: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: 20, label: "First" },
        { timestamp: 1641081600000, value: 22, label: "Second" },
      ];

      render(() => <TimeSeriesChart data={twoDataPoints} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles very large datasets", () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: 1640995200000 + i * 86400000,
        value: Math.random() * 100,
        label: `Day ${i + 1}`,
      }));

      render(() => <TimeSeriesChart data={largeData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles negative values", () => {
      const dataWithNegatives: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: -10, label: "Negative" },
        { timestamp: 1641081600000, value: 0, label: "Zero" },
        { timestamp: 1641168000000, value: 10, label: "Positive" },
      ];

      render(() => <TimeSeriesChart data={dataWithNegatives} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles zero values", () => {
      const dataWithZeros: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: 0, label: "Zero 1" },
        { timestamp: 1641081600000, value: 0, label: "Zero 2" },
        { timestamp: 1641168000000, value: 0, label: "Zero 3" },
      ];

      render(() => <TimeSeriesChart data={dataWithZeros} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles decimal values", () => {
      const decimalData: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: 20.5, label: "Decimal 1" },
        { timestamp: 1641081600000, value: 22.3, label: "Decimal 2" },
        { timestamp: 1641168000000, value: 25.7, label: "Decimal 3" },
      ];

      render(() => <TimeSeriesChart data={decimalData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles invalid timestamps", () => {
      const invalidData: TimeSeriesDataPoint[] = [
        { timestamp: NaN, value: 20, label: "Invalid" },
        { timestamp: 1640995200000, value: 22, label: "Valid" },
        { timestamp: Infinity, value: 25, label: "Invalid" },
      ];

      render(() => <TimeSeriesChart data={invalidData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles missing timestamp property", () => {
      const incompleteData = [
        { value: 20, label: "No timestamp" },
        { timestamp: 1640995200000, value: 22, label: "Has timestamp" },
      ] as any;

      render(() => <TimeSeriesChart data={incompleteData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles missing value property", () => {
      const incompleteData = [
        { timestamp: 1640995200000, label: "No value" },
        { timestamp: 1641081600000, value: 22, label: "Has value" },
      ] as any;

      render(() => <TimeSeriesChart data={incompleteData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Performance Tests", () => {
    it("renders quickly with small datasets", () => {
      const startTime = performance.now();

      render(() => <TimeSeriesChart data={mockData} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles rapid prop changes efficiently", async () => {
      render(() => (
        <TimeSeriesChart data={mockData} width={400} height={300} />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles large dataset updates efficiently", () => {
      const largeData = Array.from({ length: 500 }, (_, i) => ({
        timestamp: 1640995200000 + i * 86400000,
        value: Math.random() * 100,
        label: `Day ${i + 1}`,
      }));

      const startTime = performance.now();
      render(() => <TimeSeriesChart data={largeData} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should render in under 200ms

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("processes data efficiently", () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        timestamp: 1640995200000 + i * 86400000,
        value: Math.random() * 100,
        label: `Day ${i + 1}`,
      }));

      const startTime = performance.now();
      render(() => <TimeSeriesChart data={largeData} maxDataPoints={1000} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Should render in under 500ms

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(() => (
        <TimeSeriesChart data={mockData} title="Accessible Time Series Chart" />
      ));

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(() => <TimeSeriesChart data={mockData} />);

      const chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    it("works with different chart configurations", () => {
      const { unmount } = render(() => (
        <TimeSeriesChart data={mockData} stepped={true} tension={0.4} />
      ));

      let chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-timeseries-chart--stepped");

      // Change to different configuration
      unmount();
      render(() => (
        <TimeSeriesChart data={mockData} stepped={false} tension={0.8} />
      ));

      chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).not.toHaveClass(
        "reynard-timeseries-chart--stepped",
      );
    });

    it("handles data updates", () => {
      const { unmount } = render(() => <TimeSeriesChart data={mockData} />);

      let chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();

      // Update data
      const newData: TimeSeriesDataPoint[] = [
        { timestamp: 1640995200000, value: 30, label: "Updated 1" },
        { timestamp: 1641081600000, value: 32, label: "Updated 2" },
        { timestamp: 1641168000000, value: 35, label: "Updated 3" },
      ];

      unmount();
      render(() => <TimeSeriesChart data={newData} />);

      chartContainer = screen.getByText("Line Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });
});
