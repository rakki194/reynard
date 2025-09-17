export class HealthChecker {
    constructor() {
        Object.defineProperty(this, "intervalSec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30
        });
        Object.defineProperty(this, "timeoutSec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "task", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "checks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    async start() {
        if (this.task)
            return;
        this.task = setInterval(() => {
            this.run().catch(() => { });
        }, this.intervalSec * 1000);
    }
    async stop() {
        if (this.task)
            clearInterval(this.task);
        this.task = undefined;
    }
    add(id, fn) {
        this.checks.set(id, fn);
    }
    remove(id) {
        this.checks.delete(id);
    }
    async run() {
        for (const [, fn] of this.checks) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), this.timeoutSec * 1000);
            try {
                await fn();
            }
            catch {
                // ignore
            }
            finally {
                clearTimeout(timer);
            }
        }
    }
    static result(connectionId, isHealthy, responseTime, errorMessage, details) {
        return {
            connectionId,
            timestamp: Date.now(),
            isHealthy,
            responseTime,
            errorMessage,
            details,
        };
    }
}
