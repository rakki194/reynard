import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { LineChart } from "../LineChart";
import type { Dataset } from "../../types";

const mockDatasets: Dataset[] = [
  {
    label: "Temperature",
    data: [15, 18, 22, 25, 23, 20],
    backgroundColor: "rgba(54, 162, 235, 0.1)",
    borderColor: "rgba(54, 162, 235, 1)",
    borderWidth: 2,
    fill: true,
  },
  {
    label: "Humidity",
    data: [60, 65, 70, 75, 80, 75],
    backgroundColor: "rgba(255, 99, 132, 0.1)",
    borderColor: "rgba(255, 99, 132, 1)",
    borderWidth: 2,
    fill: true,
  },
];

const mockLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

describe("LineChart", () => {
  it("renders without crashing", () => {
    render(() => (
      <LineChart
        labels={mockLabels}
        datasets={mockDatasets}
        title="Temperature & Humidity"
      />
    ));
    
    // The component renders "Line Chart" from the mock
    expect(screen.getByText("Line Chart")).toBeInTheDocument();
  });

  it("renders with custom dimensions", () => {
    render(() => (
      <LineChart
        labels={mockLabels}
        datasets={mockDatasets}
        width={800}
        height={500}
      />
    ));
    
    // Check for the chart container div
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
        class="custom-line-chart"
      />
    ));
    
    const chartContainer = screen.getByText("Line Chart").closest("div");
    expect(chartContainer).toHaveClass("custom-line-chart");
  });

  it("renders with grid when showGrid is true", () => {
    render(() => (
      <LineChart
        labels={mockLabels}
        datasets={mockDatasets}
        showGrid={true}
      />
    ));
    
    const chartContainer = screen.getByText("Line Chart").closest("div");
    expect(chartContainer).toHaveClass("reynard-line-chart");
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
    expect(chartContainer).toHaveClass("reynard-line-chart");
  });
});
