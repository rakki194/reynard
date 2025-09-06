/**
 * Service Registry
 * 
 * Manages service registration and discovery.
 */

import { ServiceRegistry as IServiceRegistry, ServiceConfig } from '../types/index.js';

export class ServiceRegistry implements IServiceRegistry {
  private _services: Map<string, ServiceConfig> = new Map();

  register(config: ServiceConfig): void {
    if (this._services.has(config.name)) {
      console.warn(`Service '${config.name}' is already registered, overwriting`);
    }

    this._services.set(config.name, { ...config });
  }

  unregister(name: string): void {
    this._services.delete(name);
  }

  get(name: string): ServiceConfig | undefined {
    const config = this._services.get(name);
    return config ? { ...config } : undefined;
  }

  getAll(): Record<string, ServiceConfig> {
    const result: Record<string, ServiceConfig> = {};
    for (const [name, config] of this._services) {
      result[name] = { ...config };
    }
    return result;
  }

  isRegistered(name: string): boolean {
    return this._services.has(name);
  }

  getRegisteredNames(): string[] {
    return Array.from(this._services.keys());
  }

  clear(): void {
    this._services.clear();
  }

  size(): number {
    return this._services.size;
  }
}
