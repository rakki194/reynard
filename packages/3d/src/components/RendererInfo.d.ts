import { Component } from "solid-js";
import type { EmbeddingRenderingConfig } from "../types/rendering";
interface RendererInfoProps {
    pointCount: number;
    config: EmbeddingRenderingConfig;
    materialStats: {
        cached: number;
    };
    geometryStats: {
        cached: number;
    };
}
export declare const RendererInfo: Component<RendererInfoProps>;
export {};
