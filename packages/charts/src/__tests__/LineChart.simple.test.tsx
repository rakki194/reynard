import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { LineChart } from "../components/LineChart";
import type { Dataset } from "../types";

const mockDatasets: Dataset[] = [
  {
    label: "Temperature",
    data: [20, 25, 30, 28, 35],
    borderColor: "rgba(75, 192, 192, 1)",
  },
];

const mockLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

describe("LineChart - Simple Tests", () => {
  it("should render without crashing", () => {
    expect(() => {
      render(() => (
        <LineChart
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
      render(() => <LineChart data={mockDatasets} labels={mockLabels} />);
    }).not.toThrow();
  });

  it("should handle empty data gracefully", () => {
    expect(() => {
      render(() => <LineChart data={[]} labels={[]} />);
    }).not.toThrow();
  });
});
