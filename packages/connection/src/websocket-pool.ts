import { ConnectionPool } from './pool';
import { WebSocketConnection } from './websocket';
import { PoolConfig, ConnectionConfig } from './types';

export class WebSocketConnectionPool extends ConnectionPool<WebSocketConnection> {
  constructor(
    poolConfig: PoolConfig,
    private connConfig: ConnectionConfig
  ) {
    super(poolConfig);
    this.setFactory(async () => {
      const c = new WebSocketConnection(this.connConfig);
      const ok = await c.connect();
      return ok ? c : null;
    });
  }
}
