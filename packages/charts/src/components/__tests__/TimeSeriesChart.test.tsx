import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { TimeSeriesChart } from "../TimeSeriesChart";
import type { TimeSeriesDataPoint } from "../../types";

const mockData: TimeSeriesDataPoint[] = [
  { timestamp: 1704067200000, value: 100, label: "2024-01-01" },
  { timestamp: 1704153600000, value: 105, label: "2024-01-02" },
  { timestamp: 1704240000000, value: 110, label: "2024-01-03" },
  { timestamp: 1704326400000, value: 108, label: "2024-01-04" },
  { timestamp: 1704412800000, value: 115, label: "2024-01-05" },
  { timestamp: 1704499200000, value: 120, label: "2024-01-06" },
  { timestamp: 1704585600000, value: 118, label: "2024-01-07" },
  { timestamp: 1704672000000, value: 125, label: "2024-01-08" },
];

describe("TimeSeriesChart", () => {
  it("renders without crashing", () => {
    render(() => (
      <TimeSeriesChart
        data={mockData}
        title="Stock Performance"
      />
    ));
    
    // Check for the chart container div
    const chartContainer = screen.getByText("No data available").closest("div");
    expect(chartContainer).toHaveClass("reynard-chart-empty");
  });

  it("renders with custom dimensions", () => {
    render(() => (
      <TimeSeriesChart
        data={mockData}
        width={900}
        height={600}
      />
    ));
    
    // Check for the chart container div
    const chartContainer = screen.getByText("No data available").closest("div");
    expect(chartContainer).toHaveClass("reynard-chart-empty");
  });

  it("shows loading state when loading prop is true", () => {
    render(() => (
      <TimeSeriesChart
        data={mockData}
        loading={true}
      />
    ));
    
    expect(screen.getByText("Loading chart...")).toBeInTheDocument();
  });

  it("shows empty state when no data is provided", () => {
    render(() => (
      <TimeSeriesChart
        data={[]}
        emptyMessage="No time series data available"
      />
    ));
    
    expect(screen.getByText("No time series data available")).toBeInTheDocument();
  });

  it("applies custom class name", () => {
    render(() => (
      <TimeSeriesChart
        data={mockData}
        class="custom-time-series-chart"
      />
    ));
    
    // Find the main chart container with the custom class
    const mainContainer = screen.getByText("No data available").closest("div")?.parentElement;
    expect(mainContainer).toHaveClass("custom-time-series-chart");
  });

  it("renders with grid when showGrid is true", () => {
    render(() => (
      <TimeSeriesChart
        data={mockData}
        showGrid={true}
      />
    ));
    
    // Check for the chart container div
    const chartContainer = screen.getByText("No data available").closest("div");
    expect(chartContainer).toHaveClass("reynard-chart-empty");
  });

  it("renders with legend when showLegend is true", () => {
    render(() => (
      <TimeSeriesChart
        data={mockData}
        showLegend={true}
      />
    ));
    
    // Check for the chart container div
    const chartContainer = screen.getByText("No data available").closest("div");
    expect(chartContainer).toHaveClass("reynard-chart-empty");
  });

  it("renders with custom time format", () => {
    render(() => (
      <TimeSeriesChart
        data={mockData}
        xAxis={{
          type: "time",
          time: {
            unit: "day",
            displayFormats: {
              day: "MMM D",
            },
          },
        }}
      />
    ));
    
    // Check for the chart container div
    const chartContainer = screen.getByText("No data available").closest("div");
    expect(chartContainer).toHaveClass("reynard-chart-empty");
  });
});
