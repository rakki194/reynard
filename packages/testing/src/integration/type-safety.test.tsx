import { describe, it, expect } from "vitest";
import {
  createMockFn,
  createMockObject,
  createMockSolidResource,
} from "../index";

describe("Type Safety", () => {
  it("should maintain type safety across all utilities", () => {
    // This test ensures that all utilities maintain their type safety
    // when used together

    const mockFn = createMockFn((x: number) => x * 2);
    expect(mockFn(5)).toBe(10);

    const mockObj = createMockObject<{ test: (x: string) => string }>(["test"]);
    mockObj.test.mockReturnValue("mocked");
    expect(mockObj.test("input")).toBe("mocked");

    const resource = createMockSolidResource<{ id: number; name: string }>({
      id: 1,
      name: "Test",
    });
    expect(resource.latest.id).toBe(1);
    expect(resource.latest.name).toBe("Test");
  });
});
