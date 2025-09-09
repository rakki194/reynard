import { describe, it, expect, vi, beforeEach } from "vitest";
import { HTTPConnection } from "./http";
import { ConnectionType } from "./types";

describe("HTTPConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (
      !(globalThis as any).crypto ||
      typeof (globalThis as any).crypto.randomUUID !== "function"
    ) {
      (globalThis as any).crypto = {
        randomUUID: vi.fn(() => "00000000-0000-4000-8000-000000000000"),
      } as any;
    }
  });

  it("connects, sends POST JSON and receives JSON", async () => {
    const cfg = {
      name: "http",
      connectionType: ConnectionType.HTTP,
      url: "http://localhost/api",
    };
    const c = new HTTPConnection(cfg);
    const fetchMock = vi
      .fn()
      // sendImpl
      .mockResolvedValueOnce({ status: 200 })
      // receiveImpl
      .mockResolvedValueOnce({
        text: async () => JSON.stringify({ ok: true }),
      } as any);
    (global as any).fetch = fetchMock as any;
    await c.connect();
    expect(await c.send({ hello: "world" })).toBe(true);
    const data = await (c as any).receive();
    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalled();
  });

  it("healthCheck marks unhealthy on error", async () => {
    const cfg = {
      name: "http",
      connectionType: ConnectionType.HTTP,
      url: "http://localhost/api",
    };
    const c = new HTTPConnection(cfg);
    (global as any).fetch = vi.fn().mockRejectedValueOnce(new Error("boom"));
    const r = await c.healthCheck();
    expect(r.isHealthy).toBe(false);
  });
});
