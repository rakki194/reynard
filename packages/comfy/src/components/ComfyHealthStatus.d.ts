/**
 * ComfyUI Health Status Component
 *
 * Displays the current health status of the ComfyUI service.
 */
import { Component } from "solid-js";
export interface ComfyHealthStatusProps {
    /** Whether to show detailed information */
    showDetails?: boolean;
    /** Refresh interval in milliseconds */
    refreshInterval?: number;
    /** CSS class name */
    class?: string;
}
export declare const ComfyHealthStatus: Component<ComfyHealthStatusProps>;
