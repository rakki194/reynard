import type { ThreeJSInterface, SpriteLike, EmbeddingRenderingConfig, EmbeddingPoint } from "../types/rendering";
export declare class SpriteManager {
    threeJS: ThreeJSInterface;
    constructor(threeJS: ThreeJSInterface);
    createThumbnailSprites(points: EmbeddingPoint[], config: EmbeddingRenderingConfig, scene: any, onHover: (pointId: string) => void, onLeave: () => void): Promise<SpriteLike[]>;
    createTextSprites(points: EmbeddingPoint[], config: EmbeddingRenderingConfig, scene: any): Promise<SpriteLike[]>;
    disposeSprites(sprites: SpriteLike[], scene: any): void;
}
