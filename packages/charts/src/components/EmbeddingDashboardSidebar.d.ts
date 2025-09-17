/**
 * Embedding Dashboard Sidebar Component
 *
 * Handles the dashboard sidebar with stats and method selector.
 */
import { Component } from "solid-js";
export interface EmbeddingDashboardSidebarProps {
    /** Embedding statistics */
    stats: unknown;
    /** Available methods */
    availableMethods: unknown;
    /** Current reduction method */
    reductionMethod: string;
    /** Current reduction parameters */
    reductionParams: Record<string, unknown>;
    /** Maximum samples */
    maxSamples: number;
    /** Whether loading */
    isLoading: boolean;
    /** Method change handler */
    onMethodChange: (method: string) => void;
    /** Parameter update handler */
    onParameterUpdate: (key: string, value: unknown) => void;
    /** Max samples change handler */
    onMaxSamplesChange: (samples: number) => void;
    /** Reduction perform handler */
    onPerformReduction: () => void;
}
export declare const EmbeddingDashboardSidebar: Component<EmbeddingDashboardSidebarProps>;
