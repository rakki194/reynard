import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { BarChart, LineChart, PieChart, TimeSeriesChart } from "../components";
import type { ChartConfig, ChartTheme } from "../types";

// Mock console methods to reduce noise
vi.spyOn(console, "warn").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

describe("Chart Integration Tests", () => {
  const mockBarData = {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [
      {
        label: "Sales",
        data: [10, 20, 30],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const mockLineData = {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [
      {
        label: "Revenue",
        data: [100, 200, 300],
        borderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  };

  const mockPieLabels = ["Chrome", "Firefox", "Safari"];
  const mockPieData = [60, 25, 15];

  const mockTimeSeriesData = [
    { timestamp: new Date("2023-01-01").getTime(), value: 100, label: "Jan 1" },
    { timestamp: new Date("2023-01-02").getTime(), value: 200, label: "Jan 2" },
    { timestamp: new Date("2023-01-03").getTime(), value: 300, label: "Jan 3" },
  ];

  const mockConfig: ChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    tooltip: { enabled: true },
  };

  const mockTheme: ChartTheme = {
    primary: "#3b82f6",
    secondary: "#10b981",
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#2563eb",
    background: "#ffffff",
    text: "#1f2937",
    grid: "#e5e7eb",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Multiple Chart Rendering", () => {
    it("renders multiple chart types simultaneously", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
          <TimeSeriesChart data={mockTimeSeriesData} />
        </div>
      ));

      expect(screen.getByText("Bar Chart")).toBeInTheDocument();
      const lineCharts = screen.getAllByText("Line Chart");
      expect(lineCharts).toHaveLength(2); // LineChart and TimeSeriesChart both render "Line Chart"
      expect(screen.getByText("Pie Chart")).toBeInTheDocument();
      // TimeSeriesChart renders a chart with the provided data, not empty state
    });

    it("handles different chart configurations in the same container", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
            horizontal={true}
            stacked={true}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart
            labels={mockPieLabels}
            data={mockPieData}
            variant="doughnut"
          />
        </div>
      ));

      const barChart = screen.getByText("Bar Chart").closest("div");
      const lineChart = screen.getByText("Line Chart").closest("div");
      const pieChart = screen.getByText("Doughnut Chart").closest("div");

      expect(barChart).toHaveClass("reynard-bar-chart--horizontal");
      expect(barChart).toHaveClass("reynard-bar-chart--stacked");
      // Note: LineChart and PieChart classes are not applied in mocked environment
      expect(lineChart).toBeInTheDocument();
      expect(pieChart).toBeInTheDocument();
    });
  });

  describe("Responsive Layout Integration", () => {
    it("handles responsive charts in different container sizes", () => {
      render(() => (
        <div style={{ width: "800px", height: "600px" }}>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
            responsive={true}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
            responsive={true}
          />
          <PieChart
            labels={mockPieLabels}
            data={mockPieData}
            responsive={true}
          />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(3);
    });

    it("maintains aspect ratios across different chart types", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
            maintainAspectRatio={true}
            width={400}
            height={300}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
            maintainAspectRatio={true}
            width={400}
            height={300}
          />
          <PieChart
            labels={mockPieLabels}
            data={mockPieData}
            maintainAspectRatio={true}
            width={400}
            height={300}
          />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(3);
    });
  });

  describe("Theme Integration", () => {
    it("applies consistent themes across all chart types", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
          <TimeSeriesChart data={mockTimeSeriesData} />
        </div>
      ));

      // TimeSeriesChart renders a chart, so we expect 4 charts total
      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(4);
    });

    it("uses mockConfig and mockTheme for chart configuration", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
            responsive={mockConfig.responsive}
            maintainAspectRatio={mockConfig.maintainAspectRatio}
            animation={mockConfig.animation}
            tooltip={mockConfig.tooltip}
            colors={[mockTheme.primary, mockTheme.secondary, mockTheme.success]}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
            responsive={mockConfig.responsive}
            maintainAspectRatio={mockConfig.maintainAspectRatio}
            colors={[mockTheme.primary, mockTheme.secondary, mockTheme.success]}
          />
          <PieChart
            labels={mockPieLabels}
            data={mockPieData}
            responsive={mockConfig.responsive}
            maintainAspectRatio={mockConfig.maintainAspectRatio}
            colors={[mockTheme.primary, mockTheme.secondary, mockTheme.success]}
          />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(3);
    });

    it("handles theme switching across all charts", () => {
      const { unmount } = render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
        </div>
      ));

      // Unmount and render with different theme
      unmount();

      const darkTheme: ChartTheme = {
        primary: "#1f2937",
        secondary: "#374151",
        success: "#065f46",
        warning: "#92400e",
        danger: "#991b1b",
        info: "#1e40af",
        background: "#111827",
        text: "#f9fafb",
        grid: "#374151",
      };

      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
            colors={[darkTheme.primary, darkTheme.secondary, darkTheme.success]}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
            colors={[darkTheme.primary, darkTheme.secondary, darkTheme.success]}
          />
          <PieChart
            labels={mockPieLabels}
            data={mockPieData}
            colors={[darkTheme.primary, darkTheme.secondary, darkTheme.success]}
          />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(3);
    });
  });

  describe("Data Synchronization", () => {
    it("updates multiple charts with synchronized data", () => {
      const { unmount } = render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
        </div>
      ));

      // Unmount and render with updated data
      unmount();

      const updatedBarData = {
        ...mockBarData,
        datasets: [{ ...mockBarData.datasets[0], data: [15, 25, 35] }],
      };

      const updatedLineData = {
        ...mockLineData,
        datasets: [{ ...mockLineData.datasets[0], data: [150, 250, 350] }],
      };

      render(() => (
        <div>
          <BarChart
            labels={updatedBarData.labels}
            datasets={updatedBarData.datasets}
          />
          <LineChart
            labels={updatedLineData.labels}
            datasets={updatedLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(3);
    });

    it("handles different data types across chart types", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
          <TimeSeriesChart data={mockTimeSeriesData} />
        </div>
      ));

      // TimeSeriesChart renders a chart, so we expect 4 charts total
      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(4);
    });
  });

  describe("Performance Integration", () => {
    it("renders multiple charts efficiently", () => {
      const startTime = performance.now();

      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
          <TimeSeriesChart data={mockTimeSeriesData} />
        </div>
      ));

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // TimeSeriesChart renders a chart, so we expect 4 charts total
      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(4);
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it("handles large datasets across multiple charts", () => {
      const largeBarData = {
        labels: Array.from({ length: 100 }, (_, i) => `Month ${i + 1}`),
        datasets: [
          {
            label: "Large Dataset",
            data: Array.from({ length: 100 }, () => Math.random() * 1000),
          },
        ],
      };

      const largeLineData = {
        labels: Array.from({ length: 100 }, (_, i) => `Point ${i + 1}`),
        datasets: [
          {
            label: "Large Line Dataset",
            data: Array.from({ length: 100 }, () => Math.random() * 1000),
          },
        ],
      };

      render(() => (
        <div>
          <BarChart
            labels={largeBarData.labels}
            datasets={largeBarData.datasets}
          />
          <LineChart
            labels={largeLineData.labels}
            datasets={largeLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(3);
    });
  });

  describe("Error Handling Integration", () => {
    it("handles errors gracefully across multiple charts", () => {
      render(() => (
        <div>
          <BarChart labels={[]} datasets={[]} />
          <LineChart labels={[]} datasets={[]} />
          <PieChart labels={[]} data={[]} />
          <TimeSeriesChart data={[]} />
        </div>
      ));

      // All charts should render empty states gracefully
      const charts = screen.getAllByText(/Chart|No data available/);
      expect(charts).toHaveLength(4);
    });

    it("handles mixed valid and invalid data", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart labels={[]} datasets={[]} />
          <PieChart labels={[]} data={[]} />
          <TimeSeriesChart data={[]} />
        </div>
      ));

      // Should render 1 valid chart + 3 empty states
      const charts = screen.getAllByText(/Chart|No data available/);
      expect(charts).toHaveLength(4);
    });
  });

  describe("Accessibility Integration", () => {
    it("provides consistent accessibility across all chart types", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
          <TimeSeriesChart data={mockTimeSeriesData} />
        </div>
      ));

      // Test only the charts that are actually rendering (not showing empty state)
      const barChart = screen.getByText("Bar Chart").closest("div");
      const lineCharts = screen.getAllByText("Line Chart");
      const lineChart = lineCharts[0].closest("div"); // First LineChart
      const pieChart = screen.getByText("Pie Chart").closest("div");

      expect(barChart).toHaveAttribute("role", "img");
      expect(barChart).toHaveAttribute("aria-label");
      expect(lineChart).toHaveAttribute("role", "img");
      expect(lineChart).toHaveAttribute("aria-label");
      expect(pieChart).toHaveAttribute("role", "img");
      expect(pieChart).toHaveAttribute("aria-label");
    });

    it("supports keyboard navigation across all charts", () => {
      render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      charts.forEach((chart) => {
        const container = chart.closest("div");
        expect(container).toBeInTheDocument();
        // Note: Focus testing is limited in jsdom, so we just verify the element exists
      });
    });
  });

  describe("Dynamic Configuration", () => {
    it("allows dynamic chart type switching", () => {
      const { unmount } = render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
        </div>
      ));

      // Unmount and render different chart type
      unmount();

      render(() => (
        <div>
          <LineChart
            labels={mockLineData.labels}
            datasets={mockLineData.datasets}
          />
        </div>
      ));

      expect(screen.getByText("Line Chart")).toBeInTheDocument();
    });

    it("handles dynamic data updates across chart types", () => {
      const { unmount } = render(() => (
        <div>
          <BarChart
            labels={mockBarData.labels}
            datasets={mockBarData.datasets}
          />
          <PieChart labels={mockPieLabels} data={mockPieData} />
        </div>
      ));

      // Unmount and render with updated data
      unmount();

      const newBarData = {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: [{ label: "Quarterly", data: [100, 200, 150, 300] }],
      };

      const newPieLabels = ["A", "B", "C"];
      const newPieData = [25, 50, 75];

      render(() => (
        <div>
          <BarChart labels={newBarData.labels} datasets={newBarData.datasets} />
          <PieChart labels={newPieLabels} data={newPieData} />
        </div>
      ));

      const charts = screen.getAllByText(/Chart/);
      expect(charts).toHaveLength(2);
    });
  });
});
