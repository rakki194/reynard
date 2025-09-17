/**
 * Batch Progress Component
 *
 * Progress tracking display for batch processing.
 */
import { Component } from "solid-js";
export interface BatchProgressProps {
    total: number;
    completed: number;
    processing: number;
    errors: number;
    percentage: number;
    class?: string;
}
export declare const BatchProgress: Component<BatchProgressProps>;
