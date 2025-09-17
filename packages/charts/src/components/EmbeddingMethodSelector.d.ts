/**
 * Embedding Method Selector Component
 *
 * Handles dimensionality reduction method selection and parameter configuration.
 */
import { Component } from "solid-js";
export interface EmbeddingMethodSelectorProps {
    /** Available reduction methods */
    availableMethods: any;
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
    onParameterUpdate: (key: string, value: any) => void;
    /** Max samples change handler */
    onMaxSamplesChange: (samples: number) => void;
    /** Reduction perform handler */
    onPerformReduction: () => void;
}
export declare const EmbeddingMethodSelector: Component<EmbeddingMethodSelectorProps>;
