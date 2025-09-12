import { createEffect } from "solid-js";
import type {
  EmbeddingPoint,
  EmbeddingRenderingConfig,
  SceneLike,
  CameraLike,
  RendererLike,
} from "../types/rendering";

export interface PointCloudCreationConfig {
  pointCloudRenderer: () => {
    createPointCloud: (
      points: EmbeddingPoint[],
      config: EmbeddingRenderingConfig,
      scene: SceneLike,
      onPointClick: (event: MouseEvent) => void,
    ) => Promise<unknown>;
    pointCloud: () => unknown;
  };
  pointCloudEvents: () => {
    handlePointClick: (
      event: MouseEvent,
      pointCloud: unknown,
      points: EmbeddingPoint[],
      camera: CameraLike,
      renderer: RendererLike,
      onPointSelect?: (pointId: string) => void,
    ) => void;
  };
  points: EmbeddingPoint[];
  config: EmbeddingRenderingConfig;
  scene: SceneLike;
  camera: CameraLike;
  renderer: RendererLike;
  onPointSelect?: (pointId: string) => void;
}

export function usePointCloudCreation(config: PointCloudCreationConfig) {
  const createPointCloud = async () => {
    if (
      !config.pointCloudRenderer() ||
      !config.points ||
      config.points.length === 0
    )
      return;

    const handlePointClick = (event: MouseEvent) => {
      if (config.pointCloudEvents() && config.pointCloudRenderer()) {
        config
          .pointCloudEvents()
          .handlePointClick(
            event,
            config.pointCloudRenderer().pointCloud(),
            config.points,
            config.camera,
            config.renderer,
            config.onPointSelect,
          );
      }
    };

    await config
      .pointCloudRenderer()
      .createPointCloud(
        config.points,
        config.config,
        config.scene,
        handlePointClick,
      );
  };

  createEffect(() => {
    if (
      config.pointCloudRenderer() &&
      config.points &&
      config.points.length > 0
    ) {
      createPointCloud();
    }
  });

  return {
    createPointCloud,
  };
}
