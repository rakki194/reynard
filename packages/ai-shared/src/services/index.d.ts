/**
 * Shared AI/ML Services for Reynard
 *
 * This module provides base service classes and interfaces that all AI/ML
 * services in the Reynard framework should extend. These classes provide
 * common functionality for lifecycle management, health monitoring, and
 * service coordination.
 */
import { HealthCheckCallback, InitializationCallback, ServiceConfig, ServiceHealth, ServiceHealthInfo, ServiceStatus, ShutdownCallback } from "../types/index.js";
/**
 * Abstract base class for all AI/ML services in Reynard.
 *
 * Provides common functionality for:
 * - Service lifecycle management (start, stop, restart)
 * - Health monitoring and status reporting
 * - Dependency management
 * - Error handling and logging
 * - Configuration management
 *
 * All AI/ML services should extend this class to ensure consistency
 * and interoperability across the Reynard ecosystem.
 */
export declare abstract class BaseAIService {
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
    protected _healthCheckCallback?: HealthCheckCallback;
    protected _shutdownCallback?: ShutdownCallback;
    protected _initializationCallback?: InitializationCallback;
    constructor(config: ServiceConfig);
    /**
     * Initialize the service. This method should be implemented by subclasses
     * to perform any necessary setup, model loading, or resource allocation.
     */
    abstract initialize(): Promise<void>;
    /**
     * Perform a health check on the service. This method should be implemented
     * by subclasses to check if the service is functioning correctly.
     */
    abstract healthCheck(): Promise<ServiceHealthInfo>;
    /**
     * Shutdown the service gracefully. This method should be implemented by
     * subclasses to clean up resources, save state, and perform any necessary
     * cleanup operations.
     */
    abstract shutdown(): Promise<void>;
    /**
     * Get the service name
     */
    get name(): string;
    /**
     * Get the current service status
     */
    get status(): ServiceStatus;
    /**
     * Get the current service health
     */
    get health(): ServiceHealth;
    /**
     * Get service dependencies
     */
    get dependencies(): string[];
    /**
     * Get startup priority (lower = higher priority)
     */
    get startupPriority(): number;
    /**
     * Get required packages
     */
    get requiredPackages(): string[];
    /**
     * Check if service should auto-start
     */
    get autoStart(): boolean;
    /**
     * Check if service is initialized
     */
    get isInitialized(): boolean;
    /**
     * Get service metadata
     */
    get metadata(): Record<string, any>;
    /**
     * Get startup time
     */
    get startupTime(): Date | undefined;
    /**
     * Get last health check time
     */
    get lastHealthCheck(): Date | undefined;
    /**
     * Get last error message
     */
    get lastError(): string | undefined;
    /**
     * Start the service
     */
    start(): Promise<void>;
    /**
     * Stop the service
     */
    stop(): Promise<void>;
    /**
     * Restart the service
     */
    restart(): Promise<void>;
    /**
     * Set up automatic health monitoring
     */
    private _setupHealthMonitoring;
    /**
     * Stop health monitoring
     */
    private _stopHealthMonitoring;
    /**
     * Get comprehensive service information
     */
    getServiceInfo(): Promise<ServiceHealthInfo>;
    /**
     * Update service configuration
     */
    updateConfig(config: Partial<Record<string, any>>): void;
    /**
     * Get service configuration
     */
    getConfig(): Record<string, any>;
    /**
     * Get a specific configuration value
     */
    getConfigValue(key: string): any;
    /**
     * Set a specific configuration value
     */
    setConfigValue(key: string, value: any): void;
    /**
     * Set health check callback
     */
    setHealthCheckCallback(callback: HealthCheckCallback): void;
    /**
     * Set shutdown callback
     */
    setShutdownCallback(callback: ShutdownCallback): void;
    /**
     * Set initialization callback
     */
    setInitializationCallback(callback: InitializationCallback): void;
}
/**
 * Registry for managing AI/ML services
 */
export declare class ServiceRegistry {
    private _services;
    private _startupOrder;
    /**
     * Register a service
     */
    register(service: BaseAIService): void;
    /**
     * Unregister a service
     */
    unregister(serviceName: string): void;
    /**
     * Get a service by name
     */
    get(serviceName: string): BaseAIService | undefined;
    /**
     * Get all registered services
     */
    getAll(): BaseAIService[];
    /**
     * Get services in startup order
     */
    getStartupOrder(): string[];
    /**
     * Check if a service is registered
     */
    has(serviceName: string): boolean;
    /**
     * Get service count
     */
    get count(): number;
    /**
     * Update startup order based on dependencies and priorities
     */
    private _updateStartupOrder;
    /**
     * Start all services in order
     */
    startAll(): Promise<void>;
    /**
     * Stop all services in reverse order
     */
    stopAll(): Promise<void>;
}
/**
 * Get the global service registry instance
 */
export declare function getServiceRegistry(): ServiceRegistry;
/**
 * Reset the global service registry (mainly for testing)
 */
export declare function resetServiceRegistry(): void;
