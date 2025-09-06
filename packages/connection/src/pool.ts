import { PoolConfig } from './types';

export class ConnectionPool<T extends { disconnect?: () => Promise<void | boolean> } = any> {
  private pool: T[] = [];
  private inUse = new Map<string, T>();
  private factory?: () => Promise<T | null>;
  private cleanupTimer?: number;
  private healthTimer?: number;

  constructor(public readonly config: PoolConfig) {}

  setFactory(factory: () => Promise<T | null>) {
    this.factory = factory;
  }

  async start() {
    for (let i = 0; i < this.config.minSize; i++) {
      await this.create();
    }
    this.cleanupTimer = setInterval(
      () => this.cleanupIdle().catch(() => {}),
      this.config.cleanupInterval * 1000
    ) as unknown as number;
    this.healthTimer = setInterval(
      () => this.healthCheck().catch(() => {}),
      this.config.healthCheckInterval * 1000
    ) as unknown as number;
  }

  async stop() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    if (this.healthTimer) clearInterval(this.healthTimer);
    await this.closeAll();
  }

  async acquire(timeoutSec = this.config.acquireTimeout): Promise<T | null> {
    const deadline = Date.now() + timeoutSec * 1000;
    // Immediate
    const immediate = this.pool.shift();
    if (immediate) return this.markInUse(immediate);
    // Create if capacity
    if (this.inUse.size < this.config.maxSize) {
      const conn = await this.create();
      if (conn) return this.markInUse(conn);
    }
    // Wait loop
    while (Date.now() < deadline) {
      if (this.pool.length > 0) return this.markInUse(this.pool.shift()!);
      await new Promise(r => setTimeout(r, 100));
    }
    return null;
  }

  async release(conn: T): Promise<boolean> {
    const id = this.ident(conn);
    if (!this.inUse.has(id)) return false;
    this.inUse.delete(id);
    if (this.pool.length + this.inUse.size < this.config.maxSize) {
      this.pool.push(conn);
      return true;
    }
    await this.close(conn);
    return true;
  }

  private async create(): Promise<T | null> {
    if (!this.factory) return null;
    try {
      return await this.factory();
    } catch {
      return null;
    }
  }

  private ident(conn: any): string {
    return conn?.connectionId ?? String((conn && conn.id) || (conn && conn._id) || conn);
  }

  private markInUse(conn: T): T {
    this.inUse.set(this.ident(conn), conn);
    return conn;
  }

  private async close(conn: T) {
    if (typeof conn?.disconnect === 'function') {
      try {
        await conn.disconnect();
      } catch {}
    }
  }

  private async closeAll() {
    for (const conn of Array.from(this.inUse.values())) await this.close(conn);
    this.inUse.clear();
    while (this.pool.length) await this.close(this.pool.shift()!);
  }

  private async cleanupIdle() {
    // Frontend placeholder: no last_used tracking at pool level
    // Left intentionally minimal for now
  }

  private async healthCheck() {
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
      utilization: this.config.maxSize > 0 ? (this.inUse.size / this.config.maxSize) * 100 : 0,
    };
  }
}
