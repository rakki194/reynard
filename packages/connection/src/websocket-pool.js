import { ConnectionPool } from "./pool";
import { WebSocketConnection } from "./websocket";
export class WebSocketConnectionPool extends ConnectionPool {
    constructor(poolConfig, connConfig) {
        super(poolConfig);
        Object.defineProperty(this, "connConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: connConfig
        });
        this.setFactory(async () => {
            const c = new WebSocketConnection(this.connConfig);
            const ok = await c.connect();
            return ok ? c : null;
        });
    }
}
