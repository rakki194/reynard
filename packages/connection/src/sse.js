import { BaseConnection } from "./base";
import { ConnectionHealth } from "./types";
export class SSEConnection extends BaseConnection {
    constructor(config) {
        super(config);
        Object.defineProperty(this, "es", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!config.url)
            throw new Error("SSE connection requires a URL");
    }
    async connect() {
        if (await this.isConnected())
            return true;
        try {
            this.es = new EventSource(this["config"].url, {
                withCredentials: false,
            });
            await new Promise((resolve, reject) => {
                const onOpen = () => {
                    this.es?.removeEventListener("open", onOpen);
                    resolve();
                };
                const onError = () => {
                    this.es?.removeEventListener("error", onError);
                    reject(new Error("SSE open failed"));
                };
                this.es.addEventListener("open", onOpen);
                this.es.addEventListener("error", onError, { once: true });
            });
            this.setHealth?.(ConnectionHealth.HEALTHY);
            this["isActive"] = true;
            return true;
        }
        catch (e) {
            this["handleError"]?.(e, "connect");
            this["isActive"] = false;
            this.es?.close();
            this.es = undefined;
            return false;
        }
    }
    async disconnect() {
        try {
            this.es?.close();
            this.es = undefined;
            this["isActive"] = false;
            return true;
        }
        catch (e) {
            this["handleError"]?.(e, "disconnect");
            return false;
        }
    }
    async isConnected() {
        return !!this.es;
    }
    async healthCheck() {
        const start = performance.now();
        try {
            const ok = (await this.isConnected()) || (await this.connect());
            const rt = performance.now() - start;
            this.setHealth?.(ok ? ConnectionHealth.HEALTHY : ConnectionHealth.UNHEALTHY);
            return {
                connectionId: this.connectionId,
                timestamp: Date.now(),
                isHealthy: ok,
                responseTime: rt,
            };
        }
        catch (e) {
            const rt = performance.now() - start;
            this.setHealth?.(ConnectionHealth.UNHEALTHY);
            return {
                connectionId: this.connectionId,
                timestamp: Date.now(),
                isHealthy: false,
                responseTime: rt,
                errorMessage: e?.message,
            };
        }
    }
    async sendImpl(_data) {
        return false; // SSE is one-way server->client
    }
    async receiveImpl() {
        if (!this.es)
            return null;
        return await new Promise((resolve) => {
            const onMessage = (ev) => {
                this.es?.removeEventListener("message", onMessage);
                try {
                    resolve(JSON.parse(ev.data));
                }
                catch {
                    resolve({ text: ev.data });
                }
            };
            this.es.addEventListener("message", onMessage, { once: true });
        });
    }
}
