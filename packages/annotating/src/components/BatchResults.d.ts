/**
 * Batch Results Component
 *
 * Displays results from batch processing with export functionality.
 */
import { Component } from "solid-js";
import type { BatchFile } from "./BatchCaptionProcessor";
export interface BatchResultsProps {
    files: BatchFile[];
    showResults: boolean;
    onExportResults: () => void;
    class?: string;
}
export declare const BatchResults: Component<BatchResultsProps>;
