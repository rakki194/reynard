/**
 * Service Registry
 *
 * Manages service registration and discovery.
 */
import { ServiceRegistry as IServiceRegistry, ServiceConfig } from "../types/index.js";
export declare class ServiceRegistry implements IServiceRegistry {
    private _services;
    register(config: ServiceConfig): void;
    unregister(name: string): void;
    get(name: string): ServiceConfig | undefined;
    getAll(): Record<string, ServiceConfig>;
    isRegistered(name: string): boolean;
    getRegisteredNames(): string[];
    clear(): void;
    size(): number;
}
