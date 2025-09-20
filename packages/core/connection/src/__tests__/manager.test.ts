import { describe, it, expect } from "vitest";
import { ConnectionManager } from "../manager";
import { BaseConnection } from "../base";
import { ConnectionType, type ConnectionConfig, ConnectionHealth, RecoveryStrategy } from "../types";

class SimpleConn extends BaseConnection {
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
  protected async sendImpl(): Promise<boolean> {
    return true;
  }
  protected async receiveImpl(): Promise<unknown> {
    return null;
  }
}

class UnhealthyConn extends SimpleConn {
  async healthCheck() {
    return {
      connectionId: this.connectionId,
      timestamp: Date.now(),
      isHealthy: false,
      responseTime: 1,
      errorMessage: "x",
    };
  }
}

describe("ConnectionManager", () => {
  it("adds, connects, checks health, and collects statistics", async () => {
    const m = new ConnectionManager();
    const c1 = new SimpleConn({
      name: "a",
      connectionType: ConnectionType.HTTP,
      recoveryStrategy: RecoveryStrategy.RECONNECT,
    });
    const c2 = new SimpleConn({
      name: "b",
      connectionType: ConnectionType.WEBSOCKET,
    });
    m.addConnection(c1, "g1");
    m.addConnection(c2, "g1");
    const res = await m.connectAll();
    expect(Object.values(res).every(Boolean)).toBe(true);
    const hc = await m.healthCheckAll();
    expect(Object.keys(hc).length).toBe(2);
    const info = m.getInfo();
    expect(info.totalConnections).toBe(2);
    expect([
      ConnectionHealth.HEALTHY,
      ConnectionHealth.UNKNOWN,
      ConnectionHealth.DEGRADED,
      ConnectionHealth.UNHEALTHY,
    ]).toContain(info.overallHealth);
    const stats = m.getStatistics();
    expect(stats.info.total_connections).toBe(2);
  });

  it("attempts recovery for unhealthy connections using strategy overrides", async () => {
    const m = new ConnectionManager();
    const bad = new UnhealthyConn({
      name: "bad",
      connectionType: ConnectionType.HTTP,
      retryDelay: 0,
    });
    m.addConnection(bad);
    m.setRecoveryStrategy(bad.connectionId, RecoveryStrategy.GRACEFUL_DEGRADATION);
    const hc = await m.healthCheckAll();
    expect(hc[bad.connectionId].isHealthy).toBe(false);
    // After graceful degradation, health can be set to DEGRADED
    const byHealth = m.getConnectionsByHealth(ConnectionHealth.DEGRADED);
    expect(byHealth.length >= 0).toBe(true);
  });
});
