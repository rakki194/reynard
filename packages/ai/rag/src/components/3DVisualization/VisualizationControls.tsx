/**
 * Visualization Controls Component
 *
 * Main control panel for 3D visualization settings
 */
import { Show } from "solid-js";
import { Button, Select, Slider, Toggle } from "reynard-components-core";
import { Icon } from "reynard-components-core";
import { ParameterPanels } from "./ParameterPanels";
export const VisualizationControls = (props: any) => {
  return (
    <>
      {/* Main Controls Panel */}
      <div class="rag-3d-controls">
        <div class="control-group">
          <label>Reduction Method</label>
          <Select
            value={props.reductionMethod}
            onChange={value => props.setReductionMethod(value)}
            options={[
              { value: "tsne", label: "t-SNE" },
              { value: "umap", label: "UMAP" },
              { value: "pca", label: "PCA" },
            ]}
          />
        </div>

        <div class="control-group">
          <label>Point Size</label>
          <Slider value={props.settings.pointSize} onChange={props.setPointSize} min={1} max={10} step={0.5} />
        </div>

        <div class="control-group">
          <label>
            <Toggle
              size="sm"
              checked={props.settings.enableHighlighting}
              onChange={(e: any) => props.setEnableHighlighting(e.target.checked)}
            />
            Enable Highlighting
          </label>
        </div>

        <div class="control-group">
          <label>
            <Toggle
              size="sm"
              checked={props.settings.showSimilarityPaths}
              onChange={(e: any) => props.setShowSimilarityPaths(e.target.checked)}
            />
            Show Similarity Paths
          </label>
        </div>

        <div class="control-group">
          <label>
            <Toggle
              size="sm"
              checked={props.settings.showSimilarityRadius}
              onChange={(e: any) => props.setShowSimilarityRadius(e.target.checked)}
            />
            Show Similarity Radius
          </label>
        </div>

        <div class="control-group">
          <label>Radius Threshold</label>
          <Slider
            value={props.settings.radiusThreshold}
            onChange={props.setRadiusThreshold}
            min={0.1}
            max={1.0}
            step={0.1}
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => props.setShowParameterControls(!props.showParameterControls)}
          leftIcon={<Icon name="settings" />}
        >
          Advanced Parameters
        </Button>

        <Button
          variant="primary"
          onClick={props.onRefresh}
          disabled={props.isLoading}
          leftIcon={<Icon name="refresh" />}
        >
          {props.isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Parameter Controls */}
      <Show when={props.showParameterControls}>
        <ParameterPanels
          reductionMethod={props.reductionMethod}
          tsneParams={props.tsneParams}
          setTsneParams={props.setTsneParams}
          umapParams={props.umapParams}
          setUmapParams={props.setUmapParams}
          pcaParams={props.pcaParams}
          setPcaParams={props.setPcaParams}
        />
      </Show>
    </>
  );
};
