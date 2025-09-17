/**
 * Tool Registration Service
 *
 * Handles registration of tools with the NLWeb tool registry.
 * Provides a clean interface for registering default and custom tools.
 */
import { allDefaultTools } from "../tools/index.js";
export class ToolRegistrationService {
    constructor(toolRegistry, eventEmitter) {
        Object.defineProperty(this, "toolRegistry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: toolRegistry
        });
        Object.defineProperty(this, "eventEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventEmitter
        });
    }
    /**
     * Register all default tools
     */
    async registerDefaultTools() {
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
    registerTool(tool) {
        this.toolRegistry.register(tool);
        this.emitEvent("tool_registered", { toolName: tool.name });
    }
    /**
     * Register multiple tools
     */
    registerTools(tools) {
        for (const tool of tools) {
            this.toolRegistry.register(tool);
        }
        this.emitEvent("tools_registered", { count: tools.length });
    }
    /**
     * Unregister a tool by name
     */
    unregisterTool(toolName) {
        this.toolRegistry.unregister(toolName);
        this.emitEvent("tool_unregistered", { toolName });
    }
    /**
     * Get all registered tools
     */
    getRegisteredTools() {
        return this.toolRegistry.getAllTools();
    }
    /**
     * Check if a tool is registered
     */
    isToolRegistered(toolName) {
        return this.toolRegistry.getTool(toolName) !== undefined;
    }
    /**
     * Emit an event
     */
    emitEvent(type, data) {
        const event = {
            type,
            timestamp: Date.now(),
            data,
        };
        this.eventEmitter.emit(event);
    }
}
