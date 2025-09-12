/**
 * NLWeb Initialization Service
 * 
 * Handles service initialization and shutdown logic for the NLWeb service.
 */

import type {
  NLWebConfiguration,
  NLWebEvent,
  NLWebEventEmitter,
} from "../types/index.js";
import type { NLWebRouter } from "../types/index.js";
import type { ToolRegistrationService } from "./ToolRegistrationService.js";

export class NLWebInitializationService {
  constructor(
    private configuration: NLWebConfiguration,
    private eventEmitter: NLWebEventEmitter,
  ) {}

  /**
   * Initialize the service
   */
  async initialize(
    router: NLWebRouter,
    toolRegistrationService: ToolRegistrationService,
  ): Promise<void> {
    try {
      // Initialize the router
      await router.initialize();

      // Register default tools if configuration is enabled
      if (this.configuration.enabled) {
        await toolRegistrationService.registerDefaultTools();
      }

      this.emitEvent("health_check", { status: "initialized" });
    } catch (error) {
      this.emitEvent("error", {
        error: error instanceof Error ? error.message : String(error),
        phase: "initialization",
      });
      throw error;
    }
  }

  /**
   * Shutdown the service
   */
  async shutdown(router: NLWebRouter): Promise<void> {
    try {
      await router.shutdown();
      this.emitEvent("health_check", { status: "shutdown" });
    } catch (error) {
      this.emitEvent("error", {
        error: error instanceof Error ? error.message : String(error),
        phase: "shutdown",
      });
      throw error;
    }
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
