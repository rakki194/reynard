import { describe, it, expect } from "vitest";
import {
  ExponentialBackoffRetry,
  LinearBackoffRetry,
  JitterRetry,
} from "../retry";

describe("Retry strategies", () => {
  it("ExponentialBackoffRetry retries and eventually succeeds", async () => {
    let attempts = 0;
    const r = new ExponentialBackoffRetry(3, 0);
    const out = await r.execute(async () => {
      attempts += 1;
      if (attempts < 3) throw new Error("fail");
      return "ok" as const;
    });
    expect(out).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("LinearBackoffRetry throws the last error after max attempts", async () => {
    const r = new LinearBackoffRetry(2, 0);
    await expect(
      r.execute(async () => {
        throw new Error("nope");
      }),
    ).rejects.toThrow("nope");
  });

  it("JitterRetry computes delay but still executes attempts", async () => {
    const r = new JitterRetry(1, 0);
    const result = await r.execute(async () => "done" as const);
    expect(result).toBe("done");
  });
});
