import { describe, it, expect, vi } from "vitest";
import { HealthChecker } from "../health";

describe("HealthChecker", () => {
  it("adds, runs, and removes checks without throwing", async () => {
    vi.useFakeTimers();
    const hc = new HealthChecker();
    const spy = vi.fn(async () => {});
    hc.add("a", spy);
    await (hc as any)["run"]();
    expect(spy).toHaveBeenCalledTimes(1);
    hc.remove("a");
    await (hc as any)["run"]();
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
