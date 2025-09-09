import { describe, it, expect, vi } from "vitest";
import { SSEConnection } from "./sse";
import { ConnectionType } from "./types";

describe("SSEConnection", () => {
  it("connects and receives one message", async () => {
    if (
      !(globalThis as any).crypto ||
      typeof (globalThis as any).crypto.randomUUID !== "function"
    ) {
      (globalThis as any).crypto = {
        randomUUID: vi.fn(() => "00000000-0000-4000-8000-000000000000"),
      } as any;
    }
    const listeners: Record<string, Function[]> = {
      open: [],
      error: [],
      message: [],
    };
    class MockEventSource {
      url: string;
      withCredentials?: boolean;
      constructor(url: string, opts?: any) {
        this.url = url;
        this.withCredentials = opts?.withCredentials;
        setTimeout(() => listeners.open.forEach((f) => f()), 0);
      }
      addEventListener(type: string, cb: any) {
        (listeners[type] ||= []).push(cb);
      }
      removeEventListener(type: string, cb: any) {
        listeners[type] = (listeners[type] || []).filter((f) => f !== cb);
      }
      close() {}
    }
    (global as any).EventSource = MockEventSource as any;

    const c = new SSEConnection({
      name: "sse",
      connectionType: ConnectionType.SSE,
      url: "http://localhost/sse",
    });
    const ok = await c.connect();
    expect(ok).toBe(true);
    const p = (c as any).receive();
    // emit message
    listeners.message.forEach((f) => f({ data: JSON.stringify({ x: 1 }) }));
    const data = await p;
    expect(data).toEqual({ x: 1 });
    await c.disconnect();
  });
});
