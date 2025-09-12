/**
 * NLWeb Core Service
 * 
 * Core functionality for the NLWeb service including initialization,
 * health monitoring, and configuration management.
 */

import type {
  NLWebService as INLWebService,
  NLWebRouter,
  NLWebConfiguration,
  NLWebHealthStatus,
  NLWebEvent,
  NLWebEventEmitter,
} from "../types/index.js";
import { NLWebRouter as NLWebRouterImpl } from "../router/NLWebRouter.js";
import { NLWebToolRegistry as NLWebToolRegistryImpl } from "../router/NLWebToolRegistry.js";
import type { NLWebToolRegistry } from "../router/NLWebToolRegistry.js";
import { ToolRegistrationService } from "./ToolRegistrationService.js";
import { NLWebHealthService } from "./NLWebHealthService.js";
import { NLWebInitializationService } from "./NLWebInitializationService.js";

export class NLWebCoreService implements INLWebService {
  private router: NLWebRouter;
  private toolRegistry: NLWebToolRegistry;
  private toolRegistrationService: ToolRegistrationService;
  private healthService: NLWebHealthService;
  private initializationService: NLWebInitializationService;
  private configuration: NLWebConfiguration;
  private eventEmitter: NLWebEventEmitter;
  private initialized = false;

  constructor(
    configuration: NLWebConfiguration,
    eventEmitter: NLWebEventEmitter,
  ) {
    this.configuration = configuration;
    this.eventEmitter = eventEmitter;
    this.toolRegistry = new NLWebToolRegistryImpl();
    this.toolRegistrationService = new ToolRegistrationService(
      this.toolRegistry,
      eventEmitter,
    );
    this.healthService = new NLWebHealthService(configuration, eventEmitter);
    this.initializationService = new NLWebInitializationService(configuration, eventEmitter);
    this.router = new NLWebRouterImpl(this.toolRegistry, eventEmitter);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.initializationService.initialize(this.router, this.toolRegistrationService);
    this.initialized = true;
  }

  /**
   * Get the router instance
   */
  getRouter(): NLWebRouter {
    return this.router;
  }

  /**
   * Get the tool registry
   */
  getToolRegistry(): NLWebToolRegistry {
    return this.toolRegistry;
  }

  /**
   * Get service configuration
   */
  getConfiguration(): NLWebConfiguration {
    return { ...this.configuration };
  }

  /**
   * Update service configuration
   */
  async updateConfiguration(
    config: Partial<NLWebConfiguration>,
  ): Promise<void> {
    this.configuration = { ...this.configuration, ...config };

    // Reinitialize if configuration changed significantly
    if (config.enabled !== undefined || config.cache || config.performance) {
      await this.router.shutdown();
      await this.router.initialize();
    }

    this.emitEvent("health_check", { status: "configuration_updated" });
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<NLWebHealthStatus> {
    return this.healthService.getHealthStatus(this.router, this.initialized);
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await this.initializationService.shutdown(this.router);
    this.initialized = false;
  }

  /**
   * Get the tool registration service
   */
  getToolRegistrationService(): ToolRegistrationService {
    return this.toolRegistrationService;
  }

  /**
   * Emit an event
   */
  private emitEvent(type: NLWebEvent["type"], data: unknown): void {
    const event: NLWebEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    this.eventEmitter.emit(event);
  }
}
