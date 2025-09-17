import { ConnectionHealth, RecoveryStrategy, } from "./types";
import { ConnectionMetricsTracker } from "./metrics";
export class ConnectionManager {
    constructor() {
        Object.defineProperty(this, "connections", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "groups", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "eventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "globalHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "healthTask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cleanupTask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "healthIntervalSec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30
        });
        Object.defineProperty(this, "cleanupIntervalSec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 300
        });
        Object.defineProperty(this, "autoReconnect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "autoHealth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "recoveryOverrides", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "totalCreated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "totalEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Date.now()
        });
        // Analytics
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // Pools (keyed by type+name)
        Object.defineProperty(this, "pools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    async start() {
        if (this.autoHealth) {
            this.healthTask = setInterval(() => this.healthLoop().catch(() => { }), this.healthIntervalSec * 1000);
        }
        this.cleanupTask = setInterval(() => this.cleanupLoop().catch(() => { }), this.cleanupIntervalSec * 1000);
    }
    async stop() {
        if (this.healthTask)
            clearInterval(this.healthTask);
        if (this.cleanupTask)
            clearInterval(this.cleanupTask);
        // caller disconnects connections as needed
    }
    addConnection(conn, group = "default") {
        if (this.connections.has(conn.connectionId))
            return;
        this.connections.set(conn.connectionId, conn);
        this.totalCreated += 1;
        const list = this.groups.get(group) ?? [];
        list.push(conn.connectionId);
        this.groups.set(group, list);
        conn.onEvent((e) => this.handleEvent(e));
        this.metrics.set(conn.connectionId, new ConnectionMetricsTracker());
    }
    removeConnection(connectionId) {
        if (!this.connections.has(connectionId))
            return false;
        for (const [g, ids] of this.groups)
            this.groups.set(g, ids.filter((id) => id !== connectionId));
        this.connections.delete(connectionId);
        this.metrics.delete(connectionId);
        return true;
    }
    getConnection(id) {
        return this.connections.get(id);
    }
    getConnectionsByType(type) {
        return Array.from(this.connections.values()).filter((c) => c.getStatus().connectionType === type);
    }
    getConnectionsByGroup(group) {
        const ids = this.groups.get(group) ?? [];
        return ids.map((id) => this.connections.get(id)).filter(Boolean);
    }
    getConnectionsByState(state) {
        return Array.from(this.connections.values()).filter((c) => c.getStatus().state === state);
    }
    getConnectionsByHealth(health) {
        return Array.from(this.connections.values()).filter((c) => c.getStatus().health === health);
    }
    async connectAll(group) {
        const list = group
            ? this.getConnectionsByGroup(group)
            : Array.from(this.connections.values());
        const results = {};
        for (const c of list) {
            try {
                results[c.connectionId] = await c.connect();
            }
            catch {
                results[c.connectionId] = false;
            }
        }
        return results;
    }
    async disconnectAll(group) {
        const list = group
            ? this.getConnectionsByGroup(group)
            : Array.from(this.connections.values());
        const results = {};
        for (const c of list) {
            try {
                results[c.connectionId] = await c.disconnect();
            }
            catch {
                results[c.connectionId] = false;
            }
        }
        return results;
    }
    async healthCheckAll(group) {
        const list = group
            ? this.getConnectionsByGroup(group)
            : Array.from(this.connections.values());
        const out = {};
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
                if (!result.isHealthy)
                    await this.attemptRecovery(c);
            }
            catch (e) {
                out[c.connectionId] = {
                    connectionId: c.connectionId,
                    timestamp: Date.now(),
                    isHealthy: false,
                    responseTime: 0,
                    errorMessage: e?.message,
                };
            }
        }
        return out;
    }
    addEventHandler(h) {
        this.eventHandlers.push(h);
    }
    addGlobalHandler(h) {
        this.globalHandlers.push(h);
    }
    handleEvent(event) {
        this.totalEvents += 1;
        for (const h of this.eventHandlers)
            try {
                h(event);
            }
            catch { }
        for (const h of this.globalHandlers)
            try {
                h(event.eventType, event);
            }
            catch { }
        // Basic analytics hook: accept metrics/error events if emitted upstream
        if (event.eventType === "metrics") {
            const m = this.metrics.get(event.connectionId);
            const rt = Number(event.data?.response_time ?? 0);
            const ok = Boolean(event.data?.success ?? true);
            const et = event.data?.error_type;
            m?.record(rt, ok, et);
        }
        else if (event.eventType === "error") {
            const m = this.metrics.get(event.connectionId);
            const et = event.data?.error_type;
            m?.record(0, false, et);
        }
    }
    async healthLoop() {
        await this.healthCheckAll();
    }
    async cleanupLoop() {
        // Placeholder; could remove stale entries if needed
    }
    getInfo() {
        const conns = Array.from(this.connections.values());
        const total = conns.length;
        const active = conns.filter((c) => c.getStatus().isActive).length;
        const healthy = conns.filter((c) => c.getStatus().health === ConnectionHealth.HEALTHY).length;
        const degraded = conns.filter((c) => c.getStatus().health === ConnectionHealth.DEGRADED).length;
        const unhealthy = conns.filter((c) => c.getStatus().health === ConnectionHealth.UNHEALTHY).length;
        const errorConns = conns.filter((c) => c.getStatus().health === ConnectionHealth.UNKNOWN).length;
        const totalRequests = conns.reduce((a, c) => a + c.getStatus().metrics.totalRequests, 0);
        const totalErrors = conns.reduce((a, c) => a + c.getStatus().metrics.errorCount, 0);
        const avgResponseTime = total > 0
            ? conns.reduce((a, c) => a + c.getStatus().metrics.responseTime, 0) /
                total
            : 0;
        let overall = ConnectionHealth.UNKNOWN;
        if (total === 0)
            overall = ConnectionHealth.UNKNOWN;
        else if (healthy === total)
            overall = ConnectionHealth.HEALTHY;
        else if (unhealthy > 0 || errorConns > 0)
            overall = ConnectionHealth.UNHEALTHY;
        else if (degraded > 0)
            overall = ConnectionHealth.DEGRADED;
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
            const total_requests = values.reduce((a, v) => a + Number(v.total_requests ?? 0), 0);
            const failed = values.reduce((a, v) => a + Number(v.failed_requests ?? 0), 0);
            const avg_rt_sum = values.reduce((a, v) => a + Number(v.average_response_time ?? 0), 0);
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
    setRecoveryStrategy(connectionId, strategy) {
        this.recoveryOverrides.set(connectionId, strategy);
    }
    async attemptRecovery(conn) {
        const strategy = this.recoveryOverrides.get(conn.connectionId) ??
            conn["config"].recoveryStrategy;
        if (!strategy || strategy === RecoveryStrategy.NONE)
            return;
        try {
            if (strategy === RecoveryStrategy.RECONNECT) {
                await conn.reconnect();
            }
            else if (strategy === RecoveryStrategy.RECONNECT_BACKOFF) {
                const retryCount = conn["config"].retryCount ?? 3;
                let delay = (conn["config"].retryDelay ?? 1) * 1000;
                const mult = conn["config"].backoffMultiplier ?? 2;
                for (let i = 0; i < Math.max(1, retryCount); i++) {
                    const ok = await conn.reconnect();
                    if (ok)
                        return;
                    await new Promise((r) => setTimeout(r, delay));
                    delay *= Math.max(1, mult);
                }
            }
            else if (strategy === RecoveryStrategy.GRACEFUL_DEGRADATION) {
                // mark degraded; caller should react
                conn.setHealth?.(ConnectionHealth.DEGRADED);
            }
        }
        catch {
            // ignore
        }
    }
}
