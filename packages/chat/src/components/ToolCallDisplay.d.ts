/**
 * ToolCallDisplay Component for Reynard Chat System
 *
 * Displays tool execution with progress indicators, status updates,
 * and interactive controls.
 */
import { Component } from "solid-js";
import type { ToolCall } from "../types";
export interface ToolCallDisplayProps {
    toolCall: ToolCall;
    onAction?: (action: string, toolCall: ToolCall) => void;
}
export declare const ToolCallDisplay: Component<ToolCallDisplayProps>;
