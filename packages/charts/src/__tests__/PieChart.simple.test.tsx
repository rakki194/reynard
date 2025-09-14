import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { PieChart } from "../components/PieChart";

// Skip tests that require client-side rendering
// These tests fail due to Chart.js server-side rendering issues
const testDescribe = describe;

const mockData = [30, 25, 20, 15, 10];
const mockLabels = ["Red", "Blue", "Green", "Yellow", "Purple"];

testDescribe("PieChart - Simple Tests", () => {
  it("should render without crashing", () => {
    expect(() => {
      render(() => (
        <PieChart
          data={mockData}
          labels={mockLabels}
          width={400}
          height={300}
        />
      ));
    }).not.toThrow();
  });

  it("should render with minimal props", () => {
    expect(() => {
      render(() => <PieChart data={mockData} labels={mockLabels} />);
    }).not.toThrow();
  });

  it("should handle empty data gracefully", () => {
    expect(() => {
      render(() => <PieChart data={[]} labels={[]} />);
    }).not.toThrow();
  });
});
