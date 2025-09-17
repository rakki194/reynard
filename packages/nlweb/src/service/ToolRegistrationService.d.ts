/**
 * Tool Registration Service
 *
 * Handles registration of tools with the NLWeb tool registry.
 * Provides a clean interface for registering default and custom tools.
 */
import type { NLWebTool, NLWebEventEmitter } from "../types/index.js";
import type { NLWebToolRegistry } from "../router/NLWebToolRegistry.js";
export declare class ToolRegistrationService {
    private toolRegistry;
    private eventEmitter;
    constructor(toolRegistry: NLWebToolRegistry, eventEmitter: NLWebEventEmitter);
    /**
     * Register all default tools
     */
    registerDefaultTools(): Promise<void>;
    /**
     * Register a single tool
     */
    registerTool(tool: NLWebTool): void;
    /**
     * Register multiple tools
     */
    registerTools(tools: NLWebTool[]): void;
    /**
     * Unregister a tool by name
     */
    unregisterTool(toolName: string): void;
    /**
     * Get all registered tools
     */
    getRegisteredTools(): NLWebTool[];
    /**
     * Check if a tool is registered
     */
    isToolRegistered(toolName: string): boolean;
    /**
     * Emit an event
     */
    private emitEvent;
}
