/**
 * Annotation Service Registry
 *
 * This module provides a specialized service registry for annotation services
 * that integrates with the ai-shared ServiceRegistry for lifecycle management.
 */
import { ServiceRegistry } from "reynard-ai-shared";
import { AISharedBackendAnnotationService, AISharedBackendAnnotationServiceConfig } from "./AISharedBackendAnnotationService.js";
/**
 * Specialized service registry for annotation services
 */
export declare class AnnotationServiceRegistry {
    private serviceRegistry;
    private annotationServices;
    constructor(serviceRegistry?: ServiceRegistry);
    /**
     * Register an annotation service
     */
    registerAnnotationService(name: string, config: AISharedBackendAnnotationServiceConfig): AISharedBackendAnnotationService;
    /**
     * Get an annotation service by name
     */
    getAnnotationService(name: string): AISharedBackendAnnotationService | undefined;
    /**
     * Get all annotation services
     */
    getAllAnnotationServices(): AISharedBackendAnnotationService[];
    /**
     * Check if an annotation service is registered
     */
    hasAnnotationService(name: string): boolean;
    /**
     * Unregister an annotation service
     */
    unregisterAnnotationService(name: string): boolean;
    /**
     * Start all annotation services
     */
    startAllAnnotationServices(): Promise<void>;
    /**
     * Stop all annotation services
     */
    stopAllAnnotationServices(): Promise<void>;
    /**
     * Get health status of all annotation services
     */
    getHealthStatus(): Promise<Record<string, any>>;
    /**
     * Get the underlying service registry
     */
    getServiceRegistry(): ServiceRegistry;
    /**
     * Get annotation service count
     */
    get count(): number;
}
/**
 * Get the global annotation service registry instance
 */
export declare function getAnnotationServiceRegistry(): AnnotationServiceRegistry;
/**
 * Reset the global annotation service registry (mainly for testing)
 */
export declare function resetAnnotationServiceRegistry(): void;
/**
 * Create a default annotation service with standard configuration
 */
export declare function createDefaultAnnotationService(baseUrl?: string, name?: string): AISharedBackendAnnotationService;
