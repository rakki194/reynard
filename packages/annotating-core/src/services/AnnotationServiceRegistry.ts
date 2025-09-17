/**
 * Annotation Service Registry
 *
 * This module provides a specialized service registry for annotation services
 * that integrates with the ai-shared ServiceRegistry for lifecycle management.
 */

import { ServiceRegistry, getServiceRegistry, BaseAIService, ServiceConfig } from "reynard-ai-shared";
import {
  AISharedBackendAnnotationService,
  AISharedBackendAnnotationServiceConfig,
} from "./AISharedBackendAnnotationService.js";

/**
 * Specialized service registry for annotation services
 */
export class AnnotationServiceRegistry {
  private serviceRegistry: ServiceRegistry;
  private annotationServices: Map<string, AISharedBackendAnnotationService> = new Map();

  constructor(serviceRegistry?: ServiceRegistry) {
    this.serviceRegistry = serviceRegistry || getServiceRegistry();
  }

  /**
   * Register an annotation service
   */
  registerAnnotationService(
    name: string,
    config: AISharedBackendAnnotationServiceConfig
  ): AISharedBackendAnnotationService {
    const service = new AISharedBackendAnnotationService(config);

    // Register with the global service registry
    this.serviceRegistry.register(service);

    // Keep a local reference
    this.annotationServices.set(name, service);

    return service;
  }

  /**
   * Get an annotation service by name
   */
  getAnnotationService(name: string): AISharedBackendAnnotationService | undefined {
    return this.annotationServices.get(name);
  }

  /**
   * Get all annotation services
   */
  getAllAnnotationServices(): AISharedBackendAnnotationService[] {
    return Array.from(this.annotationServices.values());
  }

  /**
   * Check if an annotation service is registered
   */
  hasAnnotationService(name: string): boolean {
    return this.annotationServices.has(name);
  }

  /**
   * Unregister an annotation service
   */
  unregisterAnnotationService(name: string): boolean {
    const service = this.annotationServices.get(name);
    if (service) {
      // Unregister from global registry
      this.serviceRegistry.unregister(service.name);

      // Remove from local registry
      this.annotationServices.delete(name);

      return true;
    }
    return false;
  }

  /**
   * Start all annotation services
   */
  async startAllAnnotationServices(): Promise<void> {
    const services = this.getAllAnnotationServices();
    const startPromises = services.map(async service => {
      try {
        if (!service.isInitialized) {
          await service.start();
        }
      } catch (error) {
        console.error(`Failed to start annotation service ${service.name}:`, error);
      }
    });

    await Promise.allSettled(startPromises);
  }

  /**
   * Stop all annotation services
   */
  async stopAllAnnotationServices(): Promise<void> {
    const services = this.getAllAnnotationServices();
    const stopPromises = services.map(async service => {
      try {
        if (service.isInitialized) {
          await service.stop();
        }
      } catch (error) {
        console.error(`Failed to stop annotation service ${service.name}:`, error);
      }
    });

    await Promise.allSettled(stopPromises);
  }

  /**
   * Get health status of all annotation services
   */
  async getHealthStatus(): Promise<Record<string, any>> {
    const services = this.getAllAnnotationServices();
    const healthStatus: Record<string, any> = {};

    for (const service of services) {
      try {
        healthStatus[service.name] = await service.getServiceInfo();
      } catch (error) {
        healthStatus[service.name] = {
          status: "error",
          health: "unhealthy",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return healthStatus;
  }

  /**
   * Get the underlying service registry
   */
  getServiceRegistry(): ServiceRegistry {
    return this.serviceRegistry;
  }

  /**
   * Get annotation service count
   */
  get count(): number {
    return this.annotationServices.size;
  }
}

// ============================================================================
// Global Annotation Service Registry Instance
// ============================================================================

let globalAnnotationServiceRegistry: AnnotationServiceRegistry | null = null;

/**
 * Get the global annotation service registry instance
 */
export function getAnnotationServiceRegistry(): AnnotationServiceRegistry {
  if (!globalAnnotationServiceRegistry) {
    globalAnnotationServiceRegistry = new AnnotationServiceRegistry();
  }
  return globalAnnotationServiceRegistry;
}

/**
 * Reset the global annotation service registry (mainly for testing)
 */
export function resetAnnotationServiceRegistry(): void {
  globalAnnotationServiceRegistry = null;
}

/**
 * Create a default annotation service with standard configuration
 */
export function createDefaultAnnotationService(
  baseUrl: string = "http://localhost:8000",
  name: string = "default-annotation-service"
): AISharedBackendAnnotationService {
  const registry = getAnnotationServiceRegistry();

  const config: AISharedBackendAnnotationServiceConfig = {
    name,
    baseUrl,
    timeout: 30000,
    retries: 3,
    startupPriority: 50,
    autoStart: true,
    dependencies: [],
    requiredPackages: ["reynard-annotating-core"],
  };

  return registry.registerAnnotationService(name, config);
}
