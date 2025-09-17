/**
 * Base Service Class
 *
 * Abstract base class that all services must extend. Provides common
 * lifecycle management, health monitoring, and metadata handling.
 */
import { ServiceStatus, ServiceHealth, ServiceInfo, ServiceHealthInfo, ServiceConfig } from "../types/index.js";
export declare abstract class BaseService {
    protected _name: string;
    protected _status: ServiceStatus;
    protected _health: ServiceHealth;
    protected _dependencies: string[];
    protected _startupPriority: number;
    protected _requiredPackages: string[];
    protected _autoStart: boolean;
    protected _startupTime?: Date;
    protected _lastHealthCheck?: Date;
    protected _lastError?: string;
    protected _metadata: Record<string, any>;
    protected _healthCheckInterval?: NodeJS.Timeout;
    protected _isInitialized: boolean;
    constructor(config: ServiceConfig);
    abstract initialize(): Promise<void>;
    abstract shutdown(): Promise<void>;
    abstract healthCheck(): Promise<ServiceHealth>;
    get name(): string;
    get status(): ServiceStatus;
    get health(): ServiceHealth;
    get dependencies(): string[];
    get startupPriority(): number;
    get requiredPackages(): string[];
    get autoStart(): boolean;
    get startupTime(): Date | undefined;
    get lastHealthCheck(): Date | undefined;
    get lastError(): string | undefined;
    get metadata(): Record<string, any>;
    get isInitialized(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    protected startHealthMonitoring(): void;
    protected stopHealthMonitoring(): void;
    protected verifyDependencies(): Promise<void>;
    protected verifyRequiredPackages(): Promise<void>;
    getInfo(): ServiceInfo;
    getHealthInfo(): ServiceHealthInfo;
    updateMetadata(metadata: Record<string, any>): void;
    destroy(): void;
}
