/**
 * ServiceLoadingProgress Component
 * Loading progress indicator for service operations
 */
import { Component } from "solid-js";
export interface ServiceLoadingProgressProps {
    /** Whether to show progress */
    showProgress?: boolean;
    /** Progress percentage (0-100) */
    progress?: number;
    /** Loading message */
    message?: string;
    /** Whether to show spinner */
    showSpinner?: boolean;
}
export declare const ServiceLoadingProgress: Component<ServiceLoadingProgressProps>;
