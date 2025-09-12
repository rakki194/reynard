/**
 * NLWeb Service
 *
 * Main service facade that orchestrates the NLWeb assistant tooling and routing system.
 * Provides a unified interface for tool suggestion, performance monitoring, and configuration.
 */

import type {
  NLWebService as INLWebService,
  NLWebRouter,
  NLWebConfiguration,
  NLWebHealthStatus,
  NLWebEventEmitter,
} from "../types/index.js";
import type { NLWebToolRegistry } from "../router/NLWebToolRegistry.js";
import { NLWebCoreService } from "./NLWebCoreService.js";
import { ToolRegistrationService } from "./ToolRegistrationService.js";

export class NLWebService implements INLWebService {
  private coreService: NLWebCoreService;

  constructor(
    configuration: NLWebConfiguration,
    eventEmitter: NLWebEventEmitter,
  ) {
    this.coreService = new NLWebCoreService(configuration, eventEmitter);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    return this.coreService.initialize();
  }

  /**
   * Get the router instance
   */
  getRouter(): NLWebRouter {
    return this.coreService.getRouter();
  }

  /**
   * Get the tool registry
   */
  getToolRegistry(): NLWebToolRegistry {
    return this.coreService.getToolRegistry();
  }

  /**
   * Get service configuration
   */
  getConfiguration(): NLWebConfiguration {
    return this.coreService.getConfiguration();
  }

  /**
   * Update service configuration
   */
  async updateConfiguration(
    config: Partial<NLWebConfiguration>,
  ): Promise<void> {
    return this.coreService.updateConfiguration(config);
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<NLWebHealthStatus> {
    return this.coreService.getHealthStatus();
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    return this.coreService.shutdown();
  }

  /**
   * Get the tool registration service
   */
  getToolRegistrationService(): ToolRegistrationService {
    return this.coreService.getToolRegistrationService();
  }
}

// Re-export configuration and event emitter for backward compatibility
export { createDefaultNLWebConfiguration } from "../config/index.js";
export { SimpleEventEmitter } from "../events/index.js";
