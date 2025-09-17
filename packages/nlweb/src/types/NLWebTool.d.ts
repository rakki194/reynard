/**
 * NLWeb Tool Types
 *
 * Type definitions for NLWeb tools.
 */
export interface NLWebTool {
    /** Unique identifier for the tool */
    name: string;
    /** Human-readable description of what the tool does */
    description: string;
    /** Category for grouping tools */
    category: string;
    /** Tags for search and filtering */
    tags: string[];
    /** Tool execution path or endpoint */
    path: string;
    /** HTTP method for tool execution */
    method: "GET" | "POST" | "PUT" | "DELETE";
    /** Required parameters for tool execution */
    parameters: NLWebToolParameter[];
    /** Example usage prompts */
    examples: string[];
    /** Whether the tool is currently enabled */
    enabled: boolean;
    /** Priority for tool selection (higher = more likely to be selected) */
    priority: number;
    /** Execution timeout in milliseconds */
    timeout: number;
}
export interface NLWebToolParameter {
    /** Parameter name */
    name: string;
    /** Parameter type */
    type: "string" | "number" | "boolean" | "object" | "array";
    /** Human-readable description */
    description: string;
    /** Whether the parameter is required */
    required: boolean;
    /** Default value if not provided */
    default?: unknown;
    /** Validation constraints */
    constraints?: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
        enum?: unknown[];
    };
}
export interface NLWebToolRegistry {
    /** Register a new tool */
    registerTool(tool: NLWebTool): void;
    /** Unregister a tool */
    unregisterTool(name: string): boolean;
    /** Get all registered tools */
    getAllTools(): NLWebTool[];
    /** Get tools by category */
    getToolsByCategory(category: string): NLWebTool[];
    /** Get tools by tags */
    getToolsByTags(tags: string[]): NLWebTool[];
    /** Get available tools */
    getAvailableTools(): NLWebTool[];
    /** Get tool statistics */
    getStats(): {
        total: number;
        enabled: number;
        disabled: number;
        categories: Record<string, number>;
    };
}
