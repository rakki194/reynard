import { describe, it, expect } from "vitest";
import { WebSocketConnection } from "../websocket";
import { ConnectionType } from "../types";

class MockSocket {
  readyState = 0;
  _openHandlers: Function[] = [];
  _errorHandlers: Function[] = [];
  _messageHandlers: Function[] = [];
  constructor(_url: string) {
    setTimeout(() => {
      this.readyState = 1;
      this._openHandlers.forEach((f) => f());
    }, 0);
  }
  addEventListener(type: string, cb: any) {
    if (type === "open") this._openHandlers.push(cb);
    if (type === "error") this._errorHandlers.push(cb);
    if (type === "message") this._messageHandlers.push(cb);
  }
  removeEventListener(type: string, cb: any) {
    if (type === "open")
      this._openHandlers = this._openHandlers.filter((f) => f !== cb);
    if (type === "error")
      this._errorHandlers = this._errorHandlers.filter((f) => f !== cb);
    if (type === "message")
      this._messageHandlers = this._messageHandlers.filter((f) => f !== cb);
  }
  send(_d: any) {}
  close() {
    this.readyState = 3;
  }
}

describe("WebSocketConnection", () => {
  it("connects, sends and receives a message", async () => {
    if (
      !(globalThis as any).crypto ||
      typeof (globalThis as any).crypto.randomUUID !== "function"
    ) {
      (globalThis as any).crypto = {
        randomUUID: () => "00000000-0000-4000-8000-000000000000",
      } as any;
    }
    (global as any).WebSocket = MockSocket as any;
    const c = new WebSocketConnection({
      name: "ws",
      connectionType: ConnectionType.WEBSOCKET,
      url: "ws://localhost/ws",
    });
    const ok = await c.connect();
    expect(ok).toBe(true);
    const sendOk = await (c as any).sendImpl({ hi: 1 });
    expect(sendOk).toBe(true);
    const p = (c as any).receiveImpl();
    // emit one message
    (c as any).ws._messageHandlers.forEach((f: Function) =>
      f({ data: JSON.stringify({ a: 1 }) }),
    );
    const msg = await p;
    expect(msg).toEqual({ a: 1 });
    await c.disconnect();
  });
});
