/**
 * Embedding Information Component
 *
 * Displays embedding vector information and statistics
 */
import { Component } from "solid-js";
export interface EmbeddingInfoProps {
    embeddingVector?: number[];
    isVisible: boolean;
    onToggle: () => void;
    onCopyVector: () => void;
}
export declare const EmbeddingInfo: Component<EmbeddingInfoProps>;
