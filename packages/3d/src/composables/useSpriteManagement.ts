import { createEffect } from "solid-js";
import type { EmbeddingPoint, EmbeddingRenderingConfig, SceneLike, SpriteLike } from "../types/rendering";

export interface SpriteManagementConfig {
  pointCloudRenderer: () => {
    spriteManager: () => {
      createThumbnailSprites: (
        points: EmbeddingPoint[],
        config: EmbeddingRenderingConfig,
        scene: SceneLike,
        onHover: (pointId: string) => void,
        onLeave: () => void
      ) => Promise<SpriteLike[]>;
      createTextSprites: (
        points: EmbeddingPoint[],
        config: EmbeddingRenderingConfig,
        scene: SceneLike
      ) => Promise<SpriteLike[]>;
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

export function useSpriteManagement(config: SpriteManagementConfig) {
  const createThumbnailSprites = async () => {
    const renderer = config.pointCloudRenderer();
    const events = config.pointCloudEvents();

    if (!renderer || !events || !config.points) return;

    const sprites = await renderer.spriteManager().createThumbnailSprites(
      config.points,
      config.config,
      config.scene,
      (pointId: string) => events.handlePointHover(pointId, config.config),
      () => events.handlePointLeave(config.config)
    );

    config.setThumbnailSprites(sprites);
  };

  const createTextSprites = async () => {
    const renderer = config.pointCloudRenderer();

    if (!renderer || !config.points) return;

    const sprites = await renderer.spriteManager().createTextSprites(config.points, config.config, config.scene);

    config.setTextSprites(sprites);
  };

  createEffect(() => {
    if (config.pointCloudRenderer() && config.pointCloudEvents() && config.points) {
      createThumbnailSprites();
      createTextSprites();
    }
  });

  return {
    createThumbnailSprites,
    createTextSprites,
  };
}
