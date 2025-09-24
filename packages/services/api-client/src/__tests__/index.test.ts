import { describe, it, expect } from "vitest";
import * as all from "../index";

describe("API Client index barrel", () => {
  it("exports expected symbols", () => {
    expect(all.createReynardApiClient).toBeDefined();
    expect(typeof all.createReynardApiClient).toBe("function");
  });

  it("should export types", () => {
    // Note: TypeScript types are not available at runtime, so we can't test them directly
    // But we can test that the main function is exported
    expect(all.createReynardApiClient).toBeDefined();
  });
});
