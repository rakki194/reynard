/**
 * Development tools for file operations
 */
import { BaseTool } from "../core/BaseTool";
import { ToolExecutionContext } from "../core/types";
export declare class ReadFileTool extends BaseTool {
    constructor();
    protected executeImpl(parameters: Record<string, any>, context: ToolExecutionContext): Promise<any>;
}
export declare class WriteFileTool extends BaseTool {
    constructor();
    protected executeImpl(parameters: Record<string, any>, context: ToolExecutionContext): Promise<any>;
}
export declare class ListDirectoryTool extends BaseTool {
    constructor();
    protected executeImpl(parameters: Record<string, any>, context: ToolExecutionContext): Promise<any>;
}
