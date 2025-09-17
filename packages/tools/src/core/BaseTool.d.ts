/**
 * Abstract base class for all tools
 */
import { ToolDefinition, ToolResult, ToolExecutionContext, ToolParameter } from "./types";
export declare abstract class BaseTool {
    protected definition: ToolDefinition;
    private _metrics;
    constructor(definition: ToolDefinition);
    get name(): string;
    get description(): string;
    get category(): string;
    get tags(): string[];
    get parameters(): ToolParameter[];
    get permissions(): string[];
    get timeout(): number;
    get retryCount(): number;
    get metrics(): {
        averageExecutionTime: number;
        errorRate: number;
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        totalExecutionTime: number;
        lastCalled?: Date;
    };
    /**
     * Execute the tool with the given parameters and context
     */
    execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    /**
     * Abstract method that must be implemented by subclasses
     */
    protected abstract executeImpl(parameters: Record<string, any>, context: ToolExecutionContext): Promise<any>;
    /**
     * Validate parameters against the tool definition
     */
    protected validateParameters(parameters: Record<string, any>): void;
    /**
     * Validate parameter type
     */
    protected validateParameterType(param: ToolParameter, value: any): void;
    /**
     * Validate parameter constraints
     */
    protected validateParameterConstraints(param: ToolParameter, value: any): void;
    /**
     * Check if the user has required permissions
     */
    protected checkPermissions(context: ToolExecutionContext): void;
    /**
     * Get tool definition as JSON schema
     */
    toJSONSchema(): any;
    /**
     * Convert parameter to JSON schema
     */
    private parameterToJSONSchema;
}
