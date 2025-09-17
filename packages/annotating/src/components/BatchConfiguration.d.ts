/**
 * Batch Configuration Component
 *
 * Configuration panel for batch processing options.
 */
import { Component } from "solid-js";
export interface BatchConfigurationProps {
    selectedGenerator: string;
    availableGenerators: string[];
    maxConcurrent: number;
    force: boolean;
    postProcess: boolean;
    disabled?: boolean;
    onGeneratorChange: (generator: string) => void;
    onMaxConcurrentChange: (value: number) => void;
    onForceChange: (force: boolean) => void;
    onPostProcessChange: (postProcess: boolean) => void;
    class?: string;
}
export declare const BatchConfiguration: Component<BatchConfigurationProps>;
