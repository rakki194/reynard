import type { EmbeddingPoint, EmbeddingRenderingConfig, SceneLike, SpriteLike } from "../types/rendering";
export interface SpriteManagementConfig {
    pointCloudRenderer: () => {
        spriteManager: () => {
            createThumbnailSprites: (points: EmbeddingPoint[], config: EmbeddingRenderingConfig, scene: SceneLike, onHover: (pointId: string) => void, onLeave: () => void) => Promise<SpriteLike[]>;
            createTextSprites: (points: EmbeddingPoint[], config: EmbeddingRenderingConfig, scene: SceneLike) => Promise<SpriteLike[]>;
        };
    } | null;
    pointCloudEvents: () => {
        handlePointHover: (pointId: string, config: EmbeddingRenderingConfig) => void;
        handlePointLeave: (config: EmbeddingRenderingConfig) => void;
    } | null;
    points: EmbeddingPoint[];
    config: EmbeddingRenderingConfig;
    scene: SceneLike;
    thumbnailSprites: () => SpriteLike[];
    textSprites: () => SpriteLike[];
    setThumbnailSprites: (sprites: SpriteLike[]) => void;
    setTextSprites: (sprites: SpriteLike[]) => void;
}
export declare function useSpriteManagement(config: SpriteManagementConfig): {
    createThumbnailSprites: () => Promise<void>;
    createTextSprites: () => Promise<void>;
};
