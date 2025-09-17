import { Component } from "solid-js";
import type { EmbeddingRenderingConfig } from "../types/rendering";
interface RendererControlsProps {
    config: EmbeddingRenderingConfig;
    onConfigChange: (newConfig: EmbeddingRenderingConfig) => void;
}
export declare const RendererControls: Component<RendererControlsProps>;
export {};
