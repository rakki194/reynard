import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { UnionFindGame } from "../UnionFindGame";

describe("UnionFindGame - Simple Tests", () => {
  it("renders without crashing", () => {
    const { container } = render(() => <UnionFindGame />);
    expect(container).toBeDefined();
  });

  it("renders with custom config", () => {
    const customConfig = {
      gridSize: 8,
      targetConnections: 5,
      colors: [1, 2, 3, 4],
    };

    const { container } = render(() => <UnionFindGame config={customConfig} />);
    expect(container).toBeDefined();
  });
});
