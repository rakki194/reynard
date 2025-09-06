import { describe, it, expect } from 'vitest';
import { ConnectionPool } from './pool';

class Dummy {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
  async disconnect() {
    return true as const;
  }
}

describe('ConnectionPool', () => {
  it('acquires and releases items respecting max size', async () => {
    let counter = 0;
    const pool = new ConnectionPool<Dummy>({
      maxSize: 2,
      minSize: 0,
      maxIdleTime: 60,
      acquireTimeout: 1,
      releaseTimeout: 1,
      healthCheckInterval: 60,
      cleanupInterval: 60,
    });
    pool.setFactory(async () => new Dummy(String(++counter)));

    const a = await pool.acquire();
    const b = await pool.acquire();
    expect(a && b).toBeTruthy();
    const c = await pool.acquire(0.1);
    expect(c).toBeNull(); // exceeds max size
    await pool.release(a!);
    const d = await pool.acquire();
    expect(d).not.toBeNull();
    const stats = pool.stats();
    expect(typeof stats.utilization).toBe('number');
    await pool.stop();
  });
});
