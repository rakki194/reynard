export * from "./types";
import { ConnectionState, ConnectionHealth, } from "./types";
function nowMs() {
    return Date.now();
}
// Ensure UUID generation works across browser and Node, avoiding incorrect
// "this" binding on Web Crypto's randomUUID when the function is detached.
function randomUUIDSafe() {
    const g = globalThis;
    const webCrypto = g?.crypto;
    if (webCrypto && typeof webCrypto.randomUUID === "function") {
        try {
            return webCrypto.randomUUID.call(webCrypto);
        }
        catch {
            // fall through to Node or polyfill
        }
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodeCrypto = require("crypto");
        if (typeof nodeCrypto?.randomUUID === "function")
            return nodeCrypto.randomUUID();
    }
    catch {
        // ignore
    }
    // RFC4122 v4-ish polyfill fallback
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export class BaseConnection {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "connectionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ConnectionState.DISCONNECTED
        });
        Object.defineProperty(this, "health", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ConnectionHealth.UNKNOWN
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                responseTime: 0,
                throughput: 0,
                latency: 0,
                bandwidth: 0,
                errorRate: 0,
                availability: 100,
                successCount: 0,
                errorCount: 0,
                totalRequests: 0,
            }
        });
        Object.defineProperty(this, "lastHealthCheck", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "errorCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "consecutiveErrors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "createdAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: nowMs()
        });
        Object.defineProperty(this, "updatedAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: nowMs()
        });
        Object.defineProperty(this, "isActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isSecure", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isAuthenticated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "eventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "stateHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "healthHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // Circuit breaker
        Object.defineProperty(this, "cbFailures", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "cbLastFailure", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cbState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "closed"
        });
        this.config = config;
        this.connectionId = randomUUIDSafe();
    }
    getStatus() {
        return {
            connectionId: this.connectionId,
            name: this.config.name,
            connectionType: this.config.connectionType,
            state: this.state,
            health: this.health,
            config: this.config,
            metrics: this.metrics,
            lastHealthCheck: this.lastHealthCheck,
            lastError: this.lastError ?? undefined,
            errorCount: this.errorCount,
            consecutiveErrors: this.consecutiveErrors,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isActive: this.isActive,
            isSecure: this.isSecure,
            isAuthenticated: this.isAuthenticated,
        };
    }
    onEvent(handler) {
        this.eventHandlers.push(handler);
    }
    onStateChange(handler) {
        this.stateHandlers.push(handler);
    }
    onHealthChange(handler) {
        this.healthHandlers.push(handler);
    }
    emitEvent(eventType, data, severity = "info", message) {
        const evt = {
            eventId: randomUUIDSafe(),
            connectionId: this.connectionId,
            eventType,
            timestamp: nowMs(),
            data,
            severity,
            message,
        };
        for (const h of this.eventHandlers) {
            try {
                h(evt);
            }
            catch {
                // ignore
            }
        }
    }
    setState(newState) {
        if (newState !== this.state) {
            const old = this.state;
            this.state = newState;
            this.updatedAt = nowMs();
            this.emitEvent("state_changed", { old_state: old, new_state: newState });
            for (const h of this.stateHandlers)
                try {
                    h(newState);
                }
                catch { }
        }
    }
    setHealth(newHealth) {
        if (newHealth !== this.health) {
            const old = this.health;
            this.health = newHealth;
            this.updatedAt = nowMs();
            this.emitEvent("health_changed", {
                old_health: old,
                new_health: newHealth,
            });
            for (const h of this.healthHandlers)
                try {
                    h(newHealth);
                }
                catch { }
        }
    }
    updateMetrics(responseTime, success = true) {
        const now = nowMs();
        if (typeof responseTime === "number") {
            this.metrics.responseTime = responseTime;
            this.metrics.lastResponseTime = now;
        }
        this.metrics.totalRequests += 1;
        if (success) {
            this.metrics.successCount += 1;
            this.consecutiveErrors = 0;
        }
        else {
            this.metrics.errorCount += 1;
            this.consecutiveErrors += 1;
            this.errorCount += 1;
        }
        this.metrics.errorRate =
            this.metrics.totalRequests > 0
                ? (this.metrics.errorCount / this.metrics.totalRequests) * 100
                : 0;
        this.metrics.lastRequestTime = now;
        // Approx throughput: assume at least 1 req per second if active
        this.metrics.throughput = Math.max(this.metrics.throughput, 1);
        // Emit metrics event for analytics
        this.emitEvent("metrics", {
            response_time: responseTime ?? 0,
            success,
            error_rate: this.metrics.errorRate,
            throughput: this.metrics.throughput,
        });
    }
    handleError(error, context = "unknown") {
        const message = error instanceof Error ? error.message : String(error);
        this.lastError = message;
        this.updatedAt = nowMs();
        this.emitEvent("error", { error: message, context, error_type: error?.name ?? "Error" }, "error", message);
        // Circuit breaker
        if (this.config.circuitBreakerEnabled) {
            this.cbFailures += 1;
            this.cbLastFailure = nowMs();
            if (this.cbFailures >= (this.config.circuitBreakerThreshold ?? 5) &&
                this.cbState === "closed") {
                this.cbState = "open";
            }
        }
    }
    checkCircuitBreaker() {
        if (!this.config.circuitBreakerEnabled)
            return true;
        if (this.cbState === "open") {
            const timeoutSec = this.config.circuitBreakerTimeout ?? 60;
            const elapsedSec = this.cbLastFailure
                ? (nowMs() - this.cbLastFailure) / 1000
                : 0;
            if (elapsedSec >= timeoutSec) {
                this.cbState = "half-open";
                return true;
            }
            return false;
        }
        return true;
    }
    resetCircuitBreaker() {
        this.cbFailures = 0;
        this.cbState = "closed";
        this.cbLastFailure = undefined;
    }
    async reconnect() {
        try {
            await this.disconnect();
            const delay = (this.config.retryDelay ?? 1) * 1000;
            await new Promise((r) => setTimeout(r, delay));
            return await this.connect();
        }
        catch (e) {
            this.handleError(e, "reconnect");
            return false;
        }
    }
    async send(data) {
        if (!this.checkCircuitBreaker())
            return false;
        try {
            const start = nowMs();
            const ok = await this.sendImpl(data);
            this.updateMetrics(nowMs() - start, ok);
            if (ok)
                this.resetCircuitBreaker();
            return ok;
        }
        catch (e) {
            this.handleError(e, "send");
            this.updateMetrics(undefined, false);
            return false;
        }
    }
    async receive() {
        if (!this.checkCircuitBreaker())
            return null;
        try {
            const start = nowMs();
            const result = await this.receiveImpl();
            this.updateMetrics(nowMs() - start, result != null);
            if (result != null)
                this.resetCircuitBreaker();
            return result;
        }
        catch (e) {
            this.handleError(e, "receive");
            this.updateMetrics(undefined, false);
            return null;
        }
    }
}
