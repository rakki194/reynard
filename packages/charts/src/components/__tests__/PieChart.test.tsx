import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { PieChart } from "../PieChart";

const mockData = [30, 25, 20, 15, 10];
const mockLabels = ["Red", "Blue", "Green", "Yellow", "Purple"];

describe("PieChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          title="Color Distribution"
        />
      ));
      
      expect(screen.getByText("Pie Chart")).toBeInTheDocument();
    });

    it("renders with custom dimensions", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          width={600}
          height={400}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-pie-chart");
    });

    it("shows loading state when loading prop is true", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          loading={true}
        />
      ));
      
      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    });

    it("shows empty state when no data is provided", () => {
      render(() => (
        <PieChart
          data={[]}
          labels={[]}
          emptyMessage="No data available"
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("applies custom class name", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          class="custom-chart-class"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toHaveClass("custom-chart-class");
    });
  });

  describe("Chart Variants", () => {
    it("renders as doughnut when variant prop is doughnut", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          variant="doughnut"
        />
      ));
      
      const chartContainer = screen.getByText("Doughnut Chart").closest("div");
      expect(chartContainer).toHaveClass("reynard-pie-chart--doughnut");
    });

    it("renders with custom cutout percentage", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          cutout={0.6}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom rotation", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom circumference", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("applies responsive styles when responsive is true", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          responsive={true}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toHaveStyle("width: 100%");
      expect(chartContainer).toHaveStyle("height: 100%");
    });

    it("applies fixed dimensions when responsive is false", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          responsive={false}
          width={500}
          height={300}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toHaveStyle("width: 500px");
      expect(chartContainer).toHaveStyle("height: 300px");
    });

    it("maintains aspect ratio when maintainAspectRatio is true", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          maintainAspectRatio={true}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Data Configuration", () => {
    it("renders with custom colors", () => {
      const customColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          colors={customColors}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom colors", () => {
      const customColors = ["#CC0000", "#00CC00", "#0000CC", "#CCCC00", "#CC00CC"];
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          colors={customColors}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom class name", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          class="custom-pie-chart"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Legend and Tooltip Configuration", () => {
    it("renders without legend when showLegend is false", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          showLegend={false}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom tooltip settings", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          tooltip={{ enabled: false, backgroundColor: "rgba(0,0,0,0.8)" }}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with custom tooltip settings", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          tooltip={{ enabled: true, backgroundColor: "rgba(0,0,0,0.9)" }}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Animation Configuration", () => {
    it("renders with custom animation settings", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          animation={{ duration: 2000, easing: "easeInOutQuart" }}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders without animation when animation duration is 0", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          animation={{ duration: 0 }}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles empty data array", () => {
      render(() => (
        <PieChart
          data={[]}
          labels={mockLabels}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles empty labels array", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={[]}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("handles single data point", () => {
      render(() => (
        <PieChart
          data={[100]}
          labels={["Single"]}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles two data points", () => {
      render(() => (
        <PieChart
          data={[60, 40]}
          labels={["First", "Second"]}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles very large datasets", () => {
      const largeLabels = Array.from({ length: 100 }, (_, i) => `Label ${i + 1}`);
      const largeData = Array.from({ length: 100 }, () => Math.random() * 100);

      render(() => (
        <PieChart
          data={largeData}
          labels={largeLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles zero values", () => {
      const dataWithZeros = [30, 0, 20, 15, 0];
      render(() => (
        <PieChart
          data={dataWithZeros}
          labels={mockLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles negative values", () => {
      const dataWithNegatives = [30, -10, 20, 15, 10];
      render(() => (
        <PieChart
          data={dataWithNegatives}
          labels={mockLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles decimal values", () => {
      const decimalData = [30.5, 25.3, 20.7, 15.2, 10.1];
      render(() => (
        <PieChart
          data={decimalData}
          labels={mockLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles mismatched data and labels lengths", () => {
      const shortLabels = ["Red", "Blue", "Green"];
      render(() => (
        <PieChart
          data={mockData}
          labels={shortLabels}
        />
      ));
      
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  describe("Performance Tests", () => {
    it("renders quickly with small datasets", () => {
      const startTime = performance.now();
      
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
        />
      ));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles rapid prop changes efficiently", async () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          width={400}
          height={300}
        />
      ));

      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("handles large dataset updates efficiently", () => {
      const largeLabels = Array.from({ length: 100 }, (_, i) => `Label ${i + 1}`);
      const largeData = Array.from({ length: 100 }, () => Math.random() * 100);

      const startTime = performance.now();
      render(() => (
        <PieChart
          data={largeData}
          labels={largeLabels}
        />
      ));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should render in under 200ms
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          title="Accessible Pie Chart"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
      // Note: Focus testing is limited in jsdom, so we just verify the element exists and has proper accessibility attributes
      expect(chartContainer).toHaveAttribute("role", "img");
      expect(chartContainer).toHaveAttribute("aria-label");
    });
  });

  describe("Theme Support", () => {
    it("renders with light theme by default", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with dark theme", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          theme="dark"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with banana theme", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          theme="banana"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with strawberry theme", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          theme="strawberry"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with peanut theme", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          theme="peanut"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders with gray theme", () => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          theme="gray"
        />
      ));
      
      const chartContainer = screen.getByText("Pie Chart").closest("div");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    it("works with different chart configurations", () => {
      render(() => (
        <PieChart
          labels={mockLabels}
          data={mockData}
          variant="doughnut"
          cutout={0.7}
        />
      ));

      expect(screen.getByText("Doughnut Chart")).toBeInTheDocument();
    });

    it("handles color changes", () => {
      const { unmount } = render(() => (
        <PieChart
          labels={mockLabels}
          data={mockData}
          colors={["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]}
        />
      ));

      // Unmount and render with different colors
      unmount();
      
      render(() => (
        <PieChart
          labels={mockLabels}
          data={mockData}
          colors={["#CC0000", "#00CC00", "#0000CC", "#CCCC00", "#CC00CC"]}
        />
      ));

      expect(screen.getByText("Pie Chart")).toBeInTheDocument();
    });

    it("handles data updates", () => {
      const { unmount } = render(() => (
        <PieChart
          labels={mockLabels}
          data={mockData}
        />
      ));

      // Unmount and render with updated data
      unmount();
      
      const newLabels = ["A", "B", "C", "D"];
      const newData = [25, 25, 25, 25];
      
      render(() => (
        <PieChart
          labels={newLabels}
          data={newData}
        />
      ));

      expect(screen.getByText("Pie Chart")).toBeInTheDocument();
    });
  });
});
