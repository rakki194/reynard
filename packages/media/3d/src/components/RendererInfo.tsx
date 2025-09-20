import { Component } from "solid-js";
import type { EmbeddingRenderingConfig } from "../types/rendering";

interface RendererInfoProps {
  pointCount: number;
  config: EmbeddingRenderingConfig;
  materialStats: { cached: number };
  geometryStats: { cached: number };
}

export const RendererInfo: Component<RendererInfoProps> = props => {
  return (
    <div class="renderer-info">
      <div class="info-item">
        <span class="label">Points:</span>
        <span class="value">{props.pointCount}</span>
      </div>
      <div class="info-item">
        <span class="label">Instancing:</span>
        <span class="value">{props.config.enableInstancing ? "Enabled" : "Disabled"}</span>
      </div>
      <div class="info-item">
        <span class="label">LOD:</span>
        <span class="value">{props.config.enableLOD ? "Enabled" : "Disabled"}</span>
      </div>
      <div class="info-item">
        <span class="label">Culling:</span>
        <span class="value">{props.config.enableCulling ? "Enabled" : "Disabled"}</span>
      </div>
    </div>
  );
};
