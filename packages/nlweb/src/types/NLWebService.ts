/**
 * NLWeb Service Types
 *
 * Type definitions for NLWeb service.
 */

import { NLWebToolRegistry } from "./NLWebTool.js";
import {
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
} from "./NLWebSuggestion.js";
import { NLWebHealthStatus, NLWebConfiguration } from "./NLWebHealth.js";

export interface NLWebService {
  /** Get the router instance */
  getRouter(): NLWebRouter;
  /** Get the tool registry */
  getToolRegistry(): NLWebToolRegistry;
  /** Get health status */
  getHealthStatus(): Promise<NLWebHealthStatus>;
  /** Get configuration */
  getConfiguration(): NLWebConfiguration;
  /** Register default tools */
  registerDefaultTools(): Promise<void>;
  /** Emit event */
  emitEvent(type: string, data: unknown): void;
}

export interface NLWebRouter {
  /** Get tool suggestions */
  suggest(request: NLWebSuggestionRequest): Promise<NLWebSuggestionResponse>;
  /** Get health status */
  getHealthStatus(): Promise<NLWebHealthStatus>;
  /** Get performance statistics */
  getPerformanceStats(): unknown;
  /** Force health check */
  forceHealthCheck(): Promise<NLWebHealthStatus>;
  /** Enable emergency rollback */
  enableEmergencyRollback(): void;
  /** Disable emergency rollback */
  disableEmergencyRollback(): void;
}

export interface NLWebEventListener {
  (data: unknown): void;
}

export interface NLWebEventEmitter {
  on(type: string, listener: NLWebEventListener): void;
  off(type: string, listener: NLWebEventListener): void;
  emit(type: string, data: unknown): void;
}
