import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { PieChart } from "../PieChart";

const mockData = [300, 200, 150, 100];
const mockLabels = ["Chrome", "Firefox", "Safari", "Edge"];

describe("PieChart", () => {
  it("renders without crashing", () => {
    render(() => (
      <PieChart
        labels={mockLabels}
        data={mockData}
        title="Browser Usage"
      />
    ));
    
    // Check for the chart container div
    const chartContainer = screen.getByText("Pie Chart").closest("div");
    expect(chartContainer).toHaveClass("reynard-pie-chart");
  });

  it("renders with custom dimensions", () => {
    render(() => (
      <PieChart
        labels={mockLabels}
        data={mockData}
        width={500}
        height={500}
      />
    ));
    
    // Check for the chart container div
    const chartContainer = screen.getByText("Pie Chart").closest("div");
    expect(chartContainer).toHaveClass("reynard-pie-chart");
  });

  it("shows loading state when loading prop is true", () => {
    render(() => (
      <PieChart
        labels={mockLabels}
        data={mockData}
        loading={true}
      />
    ));
    
    expect(screen.getByText("Loading chart...")).toBeInTheDocument();
  });

  it("shows empty state when no data is provided", () => {
    render(() => (
      <PieChart
        labels={[]}
        data={[]}
        emptyMessage="No data available"
      />
    ));
    
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("applies custom class name", () => {
    render(() => (
      <PieChart
        labels={mockLabels}
        data={mockData}
        class="custom-pie-chart"
      />
    ));
    
    const chartContainer = screen.getByText("Pie Chart").closest("div");
    expect(chartContainer).toHaveClass("custom-pie-chart");
  });

  it("renders with legend when showLegend is true", () => {
    render(() => (
      <PieChart
        labels={mockLabels}
        data={mockData}
        showLegend={true}
      />
    ));
    
    const chartContainer = screen.getByText("Pie Chart").closest("div");
    expect(chartContainer).toHaveClass("reynard-pie-chart");
  });

  it("renders without legend when showLegend is false", () => {
    render(() => (
      <PieChart
        labels={mockLabels}
        data={mockData}
        showLegend={false}
      />
    ));
    
    const chartContainer = screen.getByText("Pie Chart").closest("div");
    expect(chartContainer).toHaveClass("reynard-pie-chart");
  });
});
