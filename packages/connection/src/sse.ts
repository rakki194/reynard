import { BaseConnection } from './base';
import { ConnectionConfig, ConnectionHealth, HealthCheckResult } from './types';

export class SSEConnection extends BaseConnection {
  private es?: EventSource;

  constructor(config: ConnectionConfig) {
    super(config);
    if (!config.url) throw new Error('SSE connection requires a URL');
  }

  async connect(): Promise<boolean> {
    if (await this.isConnected()) return true;
    try {
      this.es = new EventSource(this['config'].url!, { withCredentials: false } as any);
      await new Promise<void>((resolve, reject) => {
        const onOpen = () => {
          this.es?.removeEventListener('open', onOpen);
          resolve();
        };
        const onError = () => {
          this.es?.removeEventListener('error', onError as any);
          reject(new Error('SSE open failed'));
        };
        this.es!.addEventListener('open', onOpen);
        this.es!.addEventListener('error', onError as any, { once: true });
      });
      (this as any).setHealth?.(ConnectionHealth.HEALTHY);
      this['isActive'] = true;
      return true;
    } catch (e) {
      this['handleError']?.(e, 'connect');
      this['isActive'] = false;
      this.es?.close();
      this.es = undefined;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.es?.close();
      this.es = undefined;
      this['isActive'] = false;
      return true;
    } catch (e) {
      this['handleError']?.(e, 'disconnect');
      return false;
    }
  }

  async isConnected(): Promise<boolean> {
    return !!this.es;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = performance.now();
    try {
      const ok = (await this.isConnected()) || (await this.connect());
      const rt = performance.now() - start;
      (this as any).setHealth?.(ok ? ConnectionHealth.HEALTHY : ConnectionHealth.UNHEALTHY);
      return { connectionId: this.connectionId, timestamp: Date.now(), isHealthy: ok, responseTime: rt };
    } catch (e: any) {
      const rt = performance.now() - start;
      (this as any).setHealth?.(ConnectionHealth.UNHEALTHY);
      return {
        connectionId: this.connectionId,
        timestamp: Date.now(),
        isHealthy: false,
        responseTime: rt,
        errorMessage: e?.message,
      };
    }
  }

  protected async sendImpl(_data: unknown): Promise<boolean> {
    return false; // SSE is one-way server->client
  }

  protected async receiveImpl(): Promise<unknown> {
    if (!this.es) return null;
    return await new Promise<unknown>(resolve => {
      const onMessage = (ev: MessageEvent) => {
        this.es?.removeEventListener('message', onMessage as any);
        try {
          resolve(JSON.parse(ev.data));
        } catch {
          resolve({ text: ev.data });
        }
      };
      this.es!.addEventListener('message', onMessage as any, { once: true });
    });
  }
}
