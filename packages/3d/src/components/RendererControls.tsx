import { Component } from "solid-js";
import type { EmbeddingRenderingConfig } from "../types/rendering";

interface RendererControlsProps {
  config: EmbeddingRenderingConfig;
  onConfigChange: (newConfig: EmbeddingRenderingConfig) => void;
}

export const RendererControls: Component<RendererControlsProps> = (props) => {
  const updateConfiguration = (updates: Partial<EmbeddingRenderingConfig>) => {
    const newConfig = { ...props.config, ...updates };
    props.onConfigChange(newConfig);
  };

  return (
    <div class="renderer-controls">
      <button
        onClick={() =>
          updateConfiguration({
            enableInstancing: !props.config.enableInstancing,
          })
        }
        class={`control-button ${props.config.enableInstancing ? "active" : ""}`}
      >
        Toggle Instancing
      </button>

      <button
        onClick={() =>
          updateConfiguration({
            enableLOD: !props.config.enableLOD,
          })
        }
        class={`control-button ${props.config.enableLOD ? "active" : ""}`}
      >
        Toggle LOD
      </button>

      <button
        onClick={() =>
          updateConfiguration({
            enableCulling: !props.config.enableCulling,
          })
        }
        class={`control-button ${props.config.enableCulling ? "active" : ""}`}
      >
        Toggle Culling
      </button>
    </div>
  );
};
