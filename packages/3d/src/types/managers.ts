// Manager interfaces for geometry and materials
// Extracted from rendering.ts for modularity

import type { EmbeddingPoint, EmbeddingRenderingConfig } from "./core";
import type { GeometryLike, MaterialLike } from "./threejs";

export interface MaterialManager {
  createPointMaterial(config: EmbeddingRenderingConfig): MaterialLike;
  createThumbnailMaterial(config: EmbeddingRenderingConfig): MaterialLike;
  createTextMaterial(config: EmbeddingRenderingConfig): MaterialLike;
  updateMaterial(
    material: MaterialLike,
    config: EmbeddingRenderingConfig,
  ): void;
  disposeMaterial(material: MaterialLike): void;
  disposeAllMaterials(): void;
}

export interface GeometryManager {
  createPointGeometry(
    points: EmbeddingPoint[],
    config: EmbeddingRenderingConfig,
  ): GeometryLike;
  createThumbnailGeometry(
    points: EmbeddingPoint[],
    config: EmbeddingRenderingConfig,
  ): GeometryLike;
  createTextGeometry(
    points: EmbeddingPoint[],
    config: EmbeddingRenderingConfig,
  ): GeometryLike;
  updateGeometry(
    geometry: GeometryLike,
    points: EmbeddingPoint[],
    config: EmbeddingRenderingConfig,
  ): void;
  disposeGeometry(geometry: GeometryLike): void;
  disposeAllGeometries(): void;
}
