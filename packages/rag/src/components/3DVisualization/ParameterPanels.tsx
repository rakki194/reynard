/**
 * Parameter Panels Component
 * 
 * Renders algorithm-specific parameter controls for 3D visualization
 */

import { Component, Show } from "solid-js";
import { Slider } from "reynard-components";
import type { TsneParams, UmapParams, PcaParams } from "../../composables/use3DVisualizationParams";

interface ParameterPanelsProps {
  reductionMethod: "tsne" | "umap" | "pca";
  tsneParams: TsneParams;
  setTsneParams: (updater: (prev: TsneParams) => TsneParams) => void;
  umapParams: UmapParams;
  setUmapParams: (updater: (prev: UmapParams) => UmapParams) => void;
  pcaParams: PcaParams;
  setPcaParams: (updater: (prev: PcaParams) => PcaParams) => void;
}

export const ParameterPanels: Component<ParameterPanelsProps> = (props) => {
  return (
    <div class="rag-3d-parameters">
      <Show when={props.reductionMethod === "tsne"}>
        <div class="parameter-group">
          <h4>t-SNE Parameters</h4>
          <div class="parameter-row">
            <label>Perplexity</label>
            <Slider
              value={props.tsneParams.perplexity}
              onChange={(value) =>
                props.setTsneParams((prev) => ({ ...prev, perplexity: value }))
              }
              min={5}
              max={50}
              step={1}
            />
          </div>
          <div class="parameter-row">
            <label>Learning Rate</label>
            <Slider
              value={props.tsneParams.learning_rate}
              onChange={(value) =>
                props.setTsneParams((prev) => ({
                  ...prev,
                  learning_rate: value,
                }))
              }
              min={10}
              max={1000}
              step={10}
            />
          </div>
        </div>
      </Show>

      <Show when={props.reductionMethod === "umap"}>
        <div class="parameter-group">
          <h4>UMAP Parameters</h4>
          <div class="parameter-row">
            <label>N Neighbors</label>
            <Slider
              value={props.umapParams.n_neighbors}
              onChange={(value) =>
                props.setUmapParams((prev) => ({ ...prev, n_neighbors: value }))
              }
              min={2}
              max={100}
              step={1}
            />
          </div>
          <div class="parameter-row">
            <label>Min Distance</label>
            <Slider
              value={props.umapParams.min_dist}
              onChange={(value) =>
                props.setUmapParams((prev) => ({ ...prev, min_dist: value }))
              }
              min={0.01}
              max={1.0}
              step={0.01}
            />
          </div>
        </div>
      </Show>

      <Show when={props.reductionMethod === "pca"}>
        <div class="parameter-group">
          <h4>PCA Parameters</h4>
          <div class="parameter-row">
            <label>Components</label>
            <Slider
              value={props.pcaParams.n_components}
              onChange={(value) =>
                props.setPcaParams((prev) => ({ ...prev, n_components: value }))
              }
              min={2}
              max={10}
              step={1}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};
