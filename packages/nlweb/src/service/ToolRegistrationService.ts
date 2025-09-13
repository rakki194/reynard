/**
 * Tool Registration Service
 *
 * Handles registration of tools with the NLWeb tool registry.
 * Provides a clean interface for registering default and custom tools.
 */

import type {
  NLWebTool,
  NLWebEventEmitter,
  NLWebEvent,
} from "../types/index.js";
import type { NLWebToolRegistry } from "../router/NLWebToolRegistry.js";
import { allDefaultTools } from "../tools/index.js";

export class ToolRegistrationService {
  constructor(
    private toolRegistry: NLWebToolRegistry,
    private eventEmitter: NLWebEventEmitter,
  ) {}

  /**
   * Register all default tools
   */
  async registerDefaultTools(): Promise<void> {
    for (const tool of allDefaultTools) {
      this.toolRegistry.register(tool);
    }

    this.emitEvent("health_check", {
      status: "tools_registered",
      count: allDefaultTools.length,
    });
  }

  /**
   * Register a single tool
   */
  registerTool(tool: NLWebTool): void {
    this.toolRegistry.register(tool);
    this.emitEvent("tool_registered", { toolName: tool.name });
  }

  /**
   * Register multiple tools
   */
  registerTools(tools: NLWebTool[]): void {
    for (const tool of tools) {
      this.toolRegistry.register(tool);
    }
    this.emitEvent("tools_registered", { count: tools.length });
  }

  /**
   * Unregister a tool by name
   */
  unregisterTool(toolName: string): void {
    this.toolRegistry.unregister(toolName);
    this.emitEvent("tool_unregistered", { toolName });
  }

  /**
   * Get all registered tools
   */
  getRegisteredTools(): NLWebTool[] {
    return this.toolRegistry.getAllTools();
  }

  /**
   * Check if a tool is registered
   */
  isToolRegistered(toolName: string): boolean {
    return this.toolRegistry.getTool(toolName) !== undefined;
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
