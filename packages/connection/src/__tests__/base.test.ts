import { describe, it, expect, vi, beforeEach } from "vitest";
// Ensure crypto.randomUUID exists and is callable without wrong this binding
if (
  !(globalThis as any).crypto ||
  typeof (globalThis as any).crypto.randomUUID !== "function"
) {
  (globalThis as any).crypto = {
    randomUUID: vi.fn(() => "00000000-0000-4000-8000-000000000000"),
  } as any;
}
import { BaseConnection } from "../base";
import {
  ConnectionType,
  ConnectionHealth,
  type ConnectionConfig,
} from "../types";

class TestConnection extends BaseConnection {
  public sent: unknown[] = [];
  public recv: unknown[] = [];
  constructor(cfg: ConnectionConfig) {
    super(cfg);
  }
  async connect(): Promise<boolean> {
    (this as any)["isActive"] = true;
    return true;
  }
  async disconnect(): Promise<boolean> {
    (this as any)["isActive"] = false;
    return true;
  }
  async isConnected(): Promise<boolean> {
    return (this as any)["isActive"];
  }
  async healthCheck() {
    return {
      connectionId: this.connectionId,
      timestamp: Date.now(),
      isHealthy: true,
      responseTime: 1,
    };
  }
  protected async sendImpl(data: unknown): Promise<boolean> {
    this.sent.push(data);
    return true;
  }
  protected async receiveImpl(): Promise<unknown> {
    return this.recv.shift() ?? null;
  }
}

class FailingConnection extends TestConnection {
  protected async sendImpl(): Promise<boolean> {
    throw new Error("send failed");
  }
}

const baseCfg: ConnectionConfig = {
  name: "test",
  connectionType: ConnectionType.HTTP,
};

describe("BaseConnection", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("reports initial status and updates metrics on send/receive", async () => {
    const c = new TestConnection(baseCfg);
    const events: string[] = [];
    c.onEvent((e) => events.push(e.eventType));
    expect(c.getStatus().health).toBe(ConnectionHealth.UNKNOWN);
    await c.connect();
    const ok = await c.send({ a: 1 });
    expect(ok).toBe(true);
    c.recv.push({ hello: "world" });
    const r = await c.receive();
    expect(r).toEqual({ hello: "world" });
    const st = c.getStatus();
    expect(st.metrics.totalRequests).toBe(2);
    expect(events.includes("metrics")).toBe(true);
    await c.disconnect();
  });

  it("opens circuit breaker on failures and blocks subsequent send/receive until timeout", async () => {
    vi.useFakeTimers();
    const cfg: ConnectionConfig = {
      name: "cb",
      connectionType: ConnectionType.HTTP,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 1,
      circuitBreakerTimeout: 1,
    };
    const c = new FailingConnection(cfg);
    await c.connect();
    const first = await c.send({});
    expect(first).toBe(false);
    const second = await c.send({});
    expect(second).toBe(false); // blocked by open circuit
    const rec = await c.receive();
    expect(rec).toBeNull();
    // advance system time beyond timeout and then a success should reset breaker
    vi.setSystemTime(Date.now() + 1500);
    // swap impl to succeed
    (c as any).sendImpl = async () => true;
    const after = await c.send({ ok: true });
    expect(after).toBe(true);
    await c.disconnect();
    vi.useRealTimers();
  });
});
