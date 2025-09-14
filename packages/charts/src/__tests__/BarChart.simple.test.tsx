import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { BarChart } from "../components/BarChart";
import type { Dataset } from "../types";

const mockDatasets: Dataset[] = [
  {
    label: "Sales",
    data: [10, 20, 30, 40, 50],
    backgroundColor: "rgba(54, 162, 235, 0.5)",
  },
];

const mockLabels = ["Jan", "Feb", "Mar", "Apr", "May"];

describe("BarChart - Simple Tests", () => {
  it("should render without crashing", () => {
    expect(() => {
      render(() => (
        <BarChart
          data={mockDatasets}
          labels={mockLabels}
          width={400}
          height={300}
        />
      ));
    }).not.toThrow();
  });

  it("should render with minimal props", () => {
    expect(() => {
      render(() => <BarChart data={mockDatasets} labels={mockLabels} />);
    }).not.toThrow();
  });

  it("should handle empty data gracefully", () => {
    expect(() => {
      render(() => <BarChart data={[]} labels={[]} />);
    }).not.toThrow();
  });
});
