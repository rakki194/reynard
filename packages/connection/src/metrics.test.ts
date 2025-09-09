import { describe, it, expect } from "vitest";
import { ConnectionMetricsTracker } from "./metrics";

describe("ConnectionMetricsTracker", () => {
  it("records successes and failures, computes aggregates", () => {
    const t = new ConnectionMetricsTracker(5);
    t.record(10, true);
    t.record(20, false, "TimeoutError");
    t.record(30, true);
    expect(t.averageResponseTime()).toBeGreaterThan(0);
    expect(t.errorRate()).toBeGreaterThanOrEqual(0);
    const s = t.summary();
    expect(s.total_requests).toBe(3);
    expect((s as any).error_breakdown.TimeoutError).toBe(1);
  });
});
