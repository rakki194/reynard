import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { PieChart } from "../components/PieChart";

describe("PieChart Component", () => {
  const mockPieData = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple"],
    data: [12, 19, 3, 5, 2],
  };

  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should render pie chart with title", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          title="Test Pie Chart"
        />
      ));

      expect(screen.getByText("Test Pie Chart")).toBeInTheDocument();
      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });

    it("should render doughnut chart with title", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          title="Test Doughnut Chart"
          variant="doughnut"
        />
      ));

      expect(screen.getByText("Test Doughnut Chart")).toBeInTheDocument();
      expect(screen.getByTestId("doughnut-chart-canvas")).toBeInTheDocument();
    });

    it("should render without title", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
        />
      ));

      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading state", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          loading={true}
        />
      ));

      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
      expect(screen.queryByTestId("pie-chart-canvas")).not.toBeInTheDocument();
    });

    it("should hide loading state when not loading", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          loading={false}
        />
      ));

      expect(screen.queryByText("Loading chart...")).not.toBeInTheDocument();
      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should show empty message when no data", () => {
      render(() => (
        <PieChart
          labels={[]}
          data={[]}
          emptyMessage="No data available"
        />
      ));

      expect(screen.getByText("No data available")).toBeInTheDocument();
      expect(screen.queryByTestId("pie-chart-canvas")).not.toBeInTheDocument();
    });

    it("should show custom empty message", () => {
      render(() => (
        <PieChart
          labels={[]}
          data={[]}
          emptyMessage="Custom empty message"
        />
      ));

      expect(screen.getByText("Custom empty message")).toBeInTheDocument();
    });
  });

  describe("Chart Variants", () => {
    it("should render pie chart by default", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
        />
      ));

      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });

    it("should render doughnut chart when variant is doughnut", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          variant="doughnut"
        />
      ));

      expect(screen.getByTestId("doughnut-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should apply responsive classes when responsive is true", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          responsive={true}
        />
      ));

      const container = screen.getByTestId("pie-chart-canvas").closest("div").parentElement;
      expect(container).toHaveClass("reynard-pie-chart--responsive");
    });

    it("should apply fixed width classes when responsive is false", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          responsive={false}
          width={400}
          height={300}
        />
      ));

      const container = screen.getByTestId("pie-chart-canvas").closest("div").parentElement;
      expect(container).toHaveClass("reynard-pie-chart--fixed-400x300");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          title="Accessible Chart"
        />
      ));

      const container = screen.getByTestId("pie-chart-canvas").closest("div").parentElement;
      expect(container).toHaveAttribute("role", "img");
      expect(container).toHaveAttribute("aria-label", "Accessible Chart");
    });

    it("should have default ARIA label when no title", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
        />
      ));

      const container = screen.getByTestId("pie-chart-canvas").closest("div").parentElement;
      expect(container).toHaveAttribute("aria-label", "pie chart");
    });

    it("should have doughnut ARIA label for doughnut variant", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          variant="doughnut"
        />
      ));

      const container = screen.getByTestId("doughnut-chart-canvas").closest("div").parentElement;
      expect(container).toHaveAttribute("aria-label", "doughnut chart");
    });
  });

  describe("Data Handling", () => {
    it("should handle single data point", () => {
      render(() => (
        <PieChart
          labels={["Single"]}
          data={[100]}
        />
      ));

      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });

    it("should handle large datasets", () => {
      const largeLabels = Array.from({ length: 20 }, (_, i) => `Label ${i + 1}`);
      const largeData = Array.from({ length: 20 }, (_, i) => i + 1);

      render(() => (
        <PieChart
          labels={largeLabels}
          data={largeData}
        />
      ));

      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });

    it("should handle zero values", () => {
      render(() => (
        <PieChart
          labels={["Zero", "Non-zero"]}
          data={[0, 10]}
        />
      ));

      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom class", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          class="custom-pie-chart"
        />
      ));

      const container = screen.getByTestId("pie-chart-canvas").closest("div").parentElement;
      expect(container).toHaveClass("custom-pie-chart");
    });

    it("should apply custom width and height", () => {
      render(() => (
        <PieChart
          labels={mockPieData.labels}
          data={mockPieData.data}
          width={500}
          height={400}
          responsive={false}
        />
      ));

      const canvas = screen.getByTestId("pie-chart-canvas");
      expect(canvas).toHaveAttribute("width", "500");
      expect(canvas).toHaveAttribute("height", "400");
    });
  });

  describe("Edge Cases", () => {
    it("should handle mismatched labels and data lengths", () => {
      render(() => (
        <PieChart
          labels={["A", "B"]}
          data={[10, 20, 30]} // More data than labels
        />
      ));

      // Should show empty state when data is invalid
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should handle negative values", () => {
      render(() => (
        <PieChart
          labels={["Positive", "Negative"]}
          data={[10, -5]}
        />
      ));

      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });

    it("should handle very small values", () => {
      render(() => (
        <PieChart
          labels={["Small", "Tiny"]}
          data={[0.001, 0.0001]}
        />
      ));

      expect(screen.getByTestId("pie-chart-canvas")).toBeInTheDocument();
    });
  });
});