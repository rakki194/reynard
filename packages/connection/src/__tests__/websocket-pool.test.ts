import { describe, it, expect, vi } from "vitest";
import { WebSocketConnectionPool } from "../websocket-pool";
import { ConnectionType } from "../types";

// Minimal mock for WebSocket used by WebSocketConnection
class MockSocket {
  readyState = 1; // OPEN
  addEventListener(_t: string, _cb: any) {}
  removeEventListener(_t: string, _cb: any) {}
  send(_d: any) {}
  close() {
    this.readyState = 3;
  }
}

describe("WebSocketConnectionPool", () => {
  it("creates connections through factory and acquires one", async () => {
    if (!(globalThis as any).crypto || typeof (globalThis as any).crypto.randomUUID !== "function") {
      (globalThis as any).crypto = {
        randomUUID: vi.fn(() => "00000000-0000-4000-8000-000000000000"),
      } as any;
    }
    (global as any).WebSocket = MockSocket as any;
    const pool = new WebSocketConnectionPool(
      {
        maxSize: 1,
        minSize: 0,
        maxIdleTime: 60,
        acquireTimeout: 1,
        releaseTimeout: 1,
        healthCheckInterval: 60,
        cleanupInterval: 60,
      },
      {
        name: "ws",
        connectionType: ConnectionType.WEBSOCKET,
        url: "ws://localhost/ws",
      }
    );

    const c = await pool.acquire(2);
    expect(c).toBeTruthy();
    if (c) await pool.release(c);
    await pool.stop();
  });
});
