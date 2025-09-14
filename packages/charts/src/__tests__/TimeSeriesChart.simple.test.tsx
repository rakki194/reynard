import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { TimeSeriesChart } from "../components/TimeSeriesChart";

const mockData = [
  { timestamp: new Date("2025-01-01").getTime(), value: 100 },
  { timestamp: new Date("2025-01-02").getTime(), value: 120 },
  { timestamp: new Date("2025-01-03").getTime(), value: 110 },
];

describe("TimeSeriesChart - Simple Tests", () => {
  it("should render without crashing", () => {
    expect(() => {
      render(() => (
        <TimeSeriesChart
          data={mockData}
          width={400}
          height={300}
        />
      ));
    }).not.toThrow();
  });

  it("should render with minimal props", () => {
    expect(() => {
      render(() => (
        <TimeSeriesChart
          data={mockData}
        />
      ));
    }).not.toThrow();
  });

  it("should handle empty data gracefully", () => {
    expect(() => {
      render(() => (
        <TimeSeriesChart
          data={[]}
        />
      ));
    }).not.toThrow();
  });
});
