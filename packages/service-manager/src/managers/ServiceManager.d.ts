/**
 * Service Manager
 *
 * Main orchestrator for service lifecycle management, dependency resolution,
 * and health monitoring.
 */
import { BaseService } from "../services/BaseService.js";
import { ServiceManagerConfig, ServiceManagerState, ServiceEventHandler, ServiceInfo, ServiceHealth } from "../types/index.js";
export declare class ServiceManager {
    private _services;
    private _registry;
    private _dependencyGraph;
    private _config;
    private _eventHandlers;
    private _startupTasks;
    private _isStarting;
    private _isShuttingDown;
    private _startupTime?;
    private _totalStartupTime?;
    constructor(config?: ServiceManagerConfig);
    registerService(service: BaseService): void;
    registerServices(services: BaseService[]): void;
    unregisterService(name: string): void;
    getService(name: string): BaseService | undefined;
    getServices(): Map<string, BaseService>;
    getServiceInfo(name: string): ServiceInfo | undefined;
    getAllServiceInfo(): Record<string, ServiceInfo>;
    startServices(): Promise<void>;
    stopServices(): Promise<void>;
    startService(name: string): Promise<void>;
    stopService(name: string): Promise<void>;
    private _startService;
    private _performServiceStartup;
    private _stopService;
    getState(): ServiceManagerState;
    private _getStartupProgress;
    addEventListener(handler: ServiceEventHandler): void;
    removeEventListener(handler: ServiceEventHandler): void;
    private _emitEvent;
    isServiceRunning(name: string): boolean;
    isServiceHealthy(name: string): boolean;
    getServiceHealth(name: string): ServiceHealth | undefined;
    destroy(): void;
}
