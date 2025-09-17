import type { EmbeddingPoint, EmbeddingRenderingConfig } from "./core";
export * from "./core";
export * from "./threejs";
export * from "./visualization";
export * from "./managers";
export declare const RENDERING_UTILS: {
    applyColorMapping: (_points: EmbeddingPoint[], _colorMapping: string) => void;
    applySizeMapping: (_points: EmbeddingPoint[], _sizeMapping: string, _baseSize: number) => void;
    filterPoints: (_points: EmbeddingPoint[], _config: EmbeddingRenderingConfig) => EmbeddingPoint[];
};
