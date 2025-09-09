import {
  ConnectionEvent,
  ConnectionHealth,
  ConnectionInfo,
  ConnectionState,
  ConnectionType,
  HealthCheckResult,
  RecoveryStrategy,
} from "./types";
import { BaseConnection } from "./base";
import { ConnectionMetricsTracker } from "./metrics";
import { ConnectionPool } from "./pool";

type EventHandler = (e: ConnectionEvent) => void;
type GlobalHandler = (type: string, e: ConnectionEvent) => void;

export class ConnectionManager {
  private connections = new Map<string, BaseConnection>();
  private groups = new Map<string, string[]>();
  private eventHandlers: EventHandler[] = [];
  private globalHandlers: GlobalHandler[] = [];
  private healthTask?: number;
  private cleanupTask?: number;
  private healthIntervalSec = 30;
  private cleanupIntervalSec = 300;
  private autoReconnect = true;
  private autoHealth = true;
  private recoveryOverrides = new Map<string, RecoveryStrategy>();
  private totalCreated = 0;
  private totalEvents = 0;
  private startTime = Date.now();

  // Analytics
  private metrics = new Map<string, ConnectionMetricsTracker>();

  // Pools (keyed by type+name)
  private pools = new Map<string, ConnectionPool<any>>();

  async start() {
    if (this.autoHealth) {
      this.healthTask = setInterval(
        () => this.healthLoop().catch(() => {}),
        this.healthIntervalSec * 1000,
      ) as unknown as number;
    }
    this.cleanupTask = setInterval(
      () => this.cleanupLoop().catch(() => {}),
      this.cleanupIntervalSec * 1000,
    ) as unknown as number;
  }

  async stop() {
    if (this.healthTask) clearInterval(this.healthTask);
    if (this.cleanupTask) clearInterval(this.cleanupTask);
    // caller disconnects connections as needed
  }

  addConnection(conn: BaseConnection, group = "default") {
    if (this.connections.has(conn.connectionId)) return;
    this.connections.set(conn.connectionId, conn);
    this.totalCreated += 1;
    const list = this.groups.get(group) ?? [];
    list.push(conn.connectionId);
    this.groups.set(group, list);
    conn.onEvent((e) => this.handleEvent(e));
    this.metrics.set(conn.connectionId, new ConnectionMetricsTracker());
  }

  removeConnection(connectionId: string): boolean {
    if (!this.connections.has(connectionId)) return false;
    for (const [g, ids] of this.groups)
      this.groups.set(
        g,
        ids.filter((id) => id !== connectionId),
      );
    this.connections.delete(connectionId);
    this.metrics.delete(connectionId);
    return true;
  }

  getConnection(id: string): BaseConnection | undefined {
    return this.connections.get(id);
  }

  getConnectionsByType(type: ConnectionType): BaseConnection[] {
    return Array.from(this.connections.values()).filter(
      (c) => c.getStatus().connectionType === type,
    );
  }

  getConnectionsByGroup(group: string): BaseConnection[] {
    const ids = this.groups.get(group) ?? [];
    return ids.map((id) => this.connections.get(id)!).filter(Boolean);
  }

  getConnectionsByState(state: ConnectionState): BaseConnection[] {
    return Array.from(this.connections.values()).filter(
      (c) => c.getStatus().state === state,
    );
  }

  getConnectionsByHealth(health: ConnectionHealth): BaseConnection[] {
    return Array.from(this.connections.values()).filter(
      (c) => c.getStatus().health === health,
    );
  }

  async connectAll(group?: string) {
    const list = group
      ? this.getConnectionsByGroup(group)
      : Array.from(this.connections.values());
    const results: Record<string, boolean> = {};
    for (const c of list) {
      try {
        results[c.connectionId] = await c.connect();
      } catch {
        results[c.connectionId] = false;
      }
    }
    return results;
  }

  async disconnectAll(group?: string) {
    const list = group
      ? this.getConnectionsByGroup(group)
      : Array.from(this.connections.values());
    const results: Record<string, boolean> = {};
    for (const c of list) {
      try {
        results[c.connectionId] = await c.disconnect();
      } catch {
        results[c.connectionId] = false;
      }
    }
    return results;
  }

  async healthCheckAll(
    group?: string,
  ): Promise<Record<string, HealthCheckResult>> {
    const list = group
      ? this.getConnectionsByGroup(group)
      : Array.from(this.connections.values());
    const out: Record<string, HealthCheckResult> = {};
    for (const c of list) {
      try {
        const result = await c.healthCheck();
        out[c.connectionId] = {
          connectionId: c.connectionId,
          timestamp: Date.now(),
          isHealthy: result.isHealthy,
          responseTime: result.responseTime,
          errorMessage: result.errorMessage,
          details: result.details,
        };
        if (!result.isHealthy) await this.attemptRecovery(c);
      } catch (e) {
        out[c.connectionId] = {
          connectionId: c.connectionId,
          timestamp: Date.now(),
          isHealthy: false,
          responseTime: 0,
          errorMessage: (e as Error)?.message,
        };
      }
    }
    return out;
  }

  addEventHandler(h: EventHandler) {
    this.eventHandlers.push(h);
  }
  addGlobalHandler(h: GlobalHandler) {
    this.globalHandlers.push(h);
  }

  private handleEvent(event: ConnectionEvent) {
    this.totalEvents += 1;
    for (const h of this.eventHandlers)
      try {
        h(event);
      } catch {}
    for (const h of this.globalHandlers)
      try {
        h(event.eventType, event);
      } catch {}
    // Basic analytics hook: accept metrics/error events if emitted upstream
    if (event.eventType === "metrics") {
      const m = this.metrics.get(event.connectionId);
      const rt = Number((event.data as any)?.response_time ?? 0);
      const ok = Boolean((event.data as any)?.success ?? true);
      const et = (event.data as any)?.error_type as string | undefined;
      m?.record(rt, ok, et);
    } else if (event.eventType === "error") {
      const m = this.metrics.get(event.connectionId);
      const et = (event.data as any)?.error_type as string | undefined;
      m?.record(0, false, et);
    }
  }

  private async healthLoop() {
    await this.healthCheckAll();
  }

  private async cleanupLoop() {
    // Placeholder; could remove stale entries if needed
  }

  getInfo(): ConnectionInfo {
    const conns = Array.from(this.connections.values());
    const total = conns.length;
    const active = conns.filter((c) => c.getStatus().isActive).length;
    const healthy = conns.filter(
      (c) => c.getStatus().health === ConnectionHealth.HEALTHY,
    ).length;
    const degraded = conns.filter(
      (c) => c.getStatus().health === ConnectionHealth.DEGRADED,
    ).length;
    const unhealthy = conns.filter(
      (c) => c.getStatus().health === ConnectionHealth.UNHEALTHY,
    ).length;
    const errorConns = conns.filter(
      (c) => c.getStatus().health === ConnectionHealth.UNKNOWN,
    ).length;
    const totalRequests = conns.reduce(
      (a, c) => a + c.getStatus().metrics.totalRequests,
      0,
    );
    const totalErrors = conns.reduce(
      (a, c) => a + c.getStatus().metrics.errorCount,
      0,
    );
    const avgResponseTime =
      total > 0
        ? conns.reduce((a, c) => a + c.getStatus().metrics.responseTime, 0) /
          total
        : 0;
    let overall = ConnectionHealth.UNKNOWN;
    if (total === 0) overall = ConnectionHealth.UNKNOWN;
    else if (healthy === total) overall = ConnectionHealth.HEALTHY;
    else if (unhealthy > 0 || errorConns > 0)
      overall = ConnectionHealth.UNHEALTHY;
    else if (degraded > 0) overall = ConnectionHealth.DEGRADED;
    return {
      totalConnections: total,
      activeConnections: active,
      healthyConnections: healthy,
      degradedConnections: degraded,
      unhealthyConnections: unhealthy,
      errorConnections: errorConns,
      averageResponseTime: avgResponseTime,
      totalRequests,
      totalErrors,
      overallHealth: overall,
      lastUpdated: Date.now(),
    };
  }

  getStatistics() {
    const info = this.getInfo();
    const uptimeSec = Math.max(0, (Date.now() - this.startTime) / 1000);
    const aggregated = (() => {
      const values = Array.from(this.metrics.values()).map((m) => m.summary());
      const total_requests = values.reduce(
        (a, v) => a + Number(v.total_requests ?? 0),
        0,
      );
      const failed = values.reduce(
        (a, v) => a + Number(v.failed_requests ?? 0),
        0,
      );
      const avg_rt_sum = values.reduce(
        (a, v) => a + Number(v.average_response_time ?? 0),
        0,
      );
      const avg_rt = values.length ? avg_rt_sum / values.length : 0;
      const error_rate = total_requests ? (failed / total_requests) * 100 : 0;
      return {
        total_connections: values.length,
        total_requests,
        failed_requests: failed,
        average_response_time: avg_rt,
        error_rate,
      };
    })();
    return {
      uptime_seconds: uptimeSec,
      start_time: new Date(this.startTime).toISOString(),
      total_connections_created: this.totalCreated,
      total_events_processed: this.totalEvents,
      connection_groups: Array.from(this.groups.keys()),
      health_check_interval: this.healthIntervalSec,
      cleanup_interval: this.cleanupIntervalSec,
      auto_reconnect: this.autoReconnect,
      auto_health_check: this.autoHealth,
      info: {
        total_connections: info.totalConnections,
        active_connections: info.activeConnections,
        healthy_connections: info.healthyConnections,
        degraded_connections: info.degradedConnections,
        unhealthy_connections: info.unhealthyConnections,
        error_connections: info.errorConnections,
        average_response_time: info.averageResponseTime,
        total_requests: info.totalRequests,
        total_errors: info.totalErrors,
        overall_health: info.overallHealth,
      },
      analytics: aggregated,
    };
  }

  setRecoveryStrategy(connectionId: string, strategy: RecoveryStrategy) {
    this.recoveryOverrides.set(connectionId, strategy);
  }

  private async attemptRecovery(conn: BaseConnection) {
    const strategy =
      this.recoveryOverrides.get(conn.connectionId) ??
      conn["config"].recoveryStrategy;
    if (!strategy || strategy === RecoveryStrategy.NONE) return;
    try {
      if (strategy === RecoveryStrategy.RECONNECT) {
        await conn.reconnect();
      } else if (strategy === RecoveryStrategy.RECONNECT_BACKOFF) {
        const retryCount = conn["config"].retryCount ?? 3;
        let delay = (conn["config"].retryDelay ?? 1) * 1000;
        const mult = conn["config"].backoffMultiplier ?? 2;
        for (let i = 0; i < Math.max(1, retryCount); i++) {
          const ok = await conn.reconnect();
          if (ok) return;
          await new Promise((r) => setTimeout(r, delay));
          delay *= Math.max(1, mult);
        }
      } else if (strategy === RecoveryStrategy.GRACEFUL_DEGRADATION) {
        // mark degraded; caller should react
        (conn as any).setHealth?.(ConnectionHealth.DEGRADED);
      }
    } catch {
      // ignore
    }
  }
}
