export class ConnectionPool {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "pool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "inUse", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "factory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cleanupTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "healthTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    setFactory(factory) {
        this.factory = factory;
    }
    async start() {
        for (let i = 0; i < this.config.minSize; i++) {
            await this.create();
        }
        this.cleanupTimer = setInterval(() => this.cleanupIdle().catch(() => { }), this.config.cleanupInterval * 1000);
        this.healthTimer = setInterval(() => this.healthCheck().catch(() => { }), this.config.healthCheckInterval * 1000);
    }
    async stop() {
        if (this.cleanupTimer)
            clearInterval(this.cleanupTimer);
        if (this.healthTimer)
            clearInterval(this.healthTimer);
        await this.closeAll();
    }
    async acquire(timeoutSec = this.config.acquireTimeout) {
        const deadline = Date.now() + timeoutSec * 1000;
        // Immediate
        const immediate = this.pool.shift();
        if (immediate)
            return this.markInUse(immediate);
        // Create if capacity
        if (this.inUse.size < this.config.maxSize) {
            const conn = await this.create();
            if (conn)
                return this.markInUse(conn);
        }
        // Wait loop
        while (Date.now() < deadline) {
            if (this.pool.length > 0)
                return this.markInUse(this.pool.shift());
            await new Promise((r) => setTimeout(r, 100));
        }
        return null;
    }
    async release(conn) {
        const id = this.ident(conn);
        if (!this.inUse.has(id))
            return false;
        this.inUse.delete(id);
        if (this.pool.length + this.inUse.size < this.config.maxSize) {
            this.pool.push(conn);
            return true;
        }
        await this.close(conn);
        return true;
    }
    async create() {
        if (!this.factory)
            return null;
        try {
            return await this.factory();
        }
        catch {
            return null;
        }
    }
    ident(conn) {
        return (conn?.connectionId ??
            String((conn && conn.id) || (conn && conn._id) || conn));
    }
    markInUse(conn) {
        this.inUse.set(this.ident(conn), conn);
        return conn;
    }
    async close(conn) {
        if (typeof conn?.disconnect === "function") {
            try {
                await conn.disconnect();
            }
            catch { }
        }
    }
    async closeAll() {
        for (const conn of Array.from(this.inUse.values()))
            await this.close(conn);
        this.inUse.clear();
        while (this.pool.length)
            await this.close(this.pool.shift());
    }
    async cleanupIdle() {
        // Frontend placeholder: no last_used tracking at pool level
        // Left intentionally minimal for now
    }
    async healthCheck() {
        // Frontend placeholder; rely on connection-level checks where applicable
    }
    stats() {
        return {
            pool_size: this.pool.length,
            in_use: this.inUse.size,
            total_connections: this.pool.length + this.inUse.size,
            max_size: this.config.maxSize,
            min_size: this.config.minSize,
            available: this.pool.length,
            utilization: this.config.maxSize > 0
                ? (this.inUse.size / this.config.maxSize) * 100
                : 0,
        };
    }
}
