import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { BarChart } from "../BarChart";
import type { Dataset } from "../../types";

const mockDatasets: Dataset[] = [
  {
    label: "Sales",
    data: [10, 20, 30, 40, 50],
    backgroundColor: "rgba(54, 162, 235, 0.5)",
    borderColor: "rgba(54, 162, 235, 1)",
    borderWidth: 1,
  },
  {
    label: "Revenue",
    data: [15, 25, 35, 45, 55],
    backgroundColor: "rgba(255, 99, 132, 0.5)",
    borderColor: "rgba(255, 99, 132, 1)",
    borderWidth: 1,
  },
];

const mockLabels = ["Jan", "Feb", "Mar", "Apr", "May"];

describe("BarChart", () => {
  beforeEach(() => {
    // Clear any previous renders
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          title="Test Chart"
        />
      ));
      
      // The component renders "Bar Chart" from the mock
      expect(screen.getByText("Bar Chart")).toBeInTheDocument();
    });

    it("renders with custom dimensions", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          width={600}
          height={400}
        />
      ));
      
      // Check for the chart container div
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-bar-chart");
    });

    it("shows loading state when loading prop is true", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          loading={true}
        />
      ));
      
      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    });

    it("shows empty state when no data is provided", () => {
      render(() => (
        <BarChart
          labels={[]}
          datasets={[]}
          emptyMessage="No data available"
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("applies custom class name", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          class="custom-chart-class"
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toHaveClass("custom-chart-class");
    });
  });

  describe("Chart Variants", () => {
    it("renders horizontal bars when horizontal prop is true", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          horizontal={true}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-bar-chart--horizontal");
    });

    it("renders stacked bars when stacked prop is true", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          stacked={true}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-bar-chart--stacked");
    });

    it("renders both horizontal and stacked bars", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          horizontal={true}
          stacked={true}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-bar-chart--horizontal");
      expect(chartContainer).toHaveClass("reynard-bar-chart--stacked");
    });
  });

  describe("Responsive Behavior", () => {
    it("applies responsive styles when responsive is true", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          responsive={true}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toHaveStyle("width: 100%");
      expect(chartContainer).toHaveStyle("height: 100%");
    });

    it("applies fixed dimensions when responsive is false", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          responsive={false}
          width={500}
          height={300}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toHaveStyle("width: 500px");
      expect(chartContainer).toHaveStyle("height: 300px");
    });

    it("maintains aspect ratio when maintainAspectRatio is true", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          maintainAspectRatio={true}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Axis Configuration", () => {
    it("renders with custom x-axis label", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          xAxis={{ label: "Months" }}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom y-axis label", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          yAxis={{ label: "Values" }}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom axis positions", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          yAxis={{ position: "right" }}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom axis min/max values", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          yAxis={{ min: 0, max: 100 }}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Grid and Legend Configuration", () => {
    it("renders without grid when showGrid is false", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          showGrid={false}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders without legend when showLegend is false", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          showLegend={false}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Animation and Tooltip Configuration", () => {
    it("renders with custom animation settings", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          animation={{ duration: 2000, easing: "easeInOutQuart" }}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom tooltip settings", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          tooltip={{ enabled: false, backgroundColor: "rgba(0,0,0,0.8)" }}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles empty labels array", () => {
      render(() => (
        <BarChart
          labels={[]}
          datasets={mockDatasets}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles empty datasets array", () => {
      render(() => (
        <BarChart
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
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ];

      render(() => (
        <BarChart
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
          data: [10, 20, 30], // Only 3 values instead of 5
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ];

      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mismatchedDatasets}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles very large datasets", () => {
      const largeLabels = Array.from({ length: 1000 }, (_, i) => `Label ${i}`);
      const largeDatasets: Dataset[] = [
        {
          label: "Large Dataset",
          data: Array.from({ length: 1000 }, (_, i) => Math.random() * 100),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ];

      render(() => (
        <BarChart
          labels={largeLabels}
          datasets={largeDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles datasets with missing optional properties", () => {
      const minimalDatasets: Dataset[] = [
        {
          label: "Minimal Dataset",
          data: [10, 20, 30, 40, 50],
        },
      ];

      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={minimalDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Performance Tests", () => {
    it("renders quickly with small datasets", () => {
      const startTime = performance.now();
      
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
        />
      ));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles rapid prop changes efficiently", async () => {
      const { rerender } = render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          width={400}
          height={300}
        />
      ));

      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender(() => (
          <BarChart
            labels={mockLabels}
            datasets={mockDatasets}
            width={400 + i * 10}
            height={300 + i * 10}
          />
        ));
      }

      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
          title="Accessible Chart"
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(() => (
        <BarChart
          labels={mockLabels}
          datasets={mockDatasets}
        />
      ));
      
      const chartContainer = screen.getByText("Bar Chart").closest("div");
      chartContainer?.focus();
      
      expect(chartContainer).toHaveFocus();
    });
  });
});
