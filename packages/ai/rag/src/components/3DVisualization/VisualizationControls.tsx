/**
 * Visualization Controls Component
 *
 * Main control panel for 3D visualization settings
 */
import { Show } from "solid-js";
import { Button, Select, Slider, Toggle } from "reynard-components-core";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import { ParameterPanels } from "./ParameterPanels";
// Helper function to get icon as JSX element
const getIcon = name => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    // Use the proper Reynard pattern for rendering SVG icons
    // eslint-disable-next-line solid/no-innerhtml
    return <div class="icon-wrapper" innerHTML={icon.outerHTML} />;
  }
  return null;
};
export const VisualizationControls = props => {
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
              onChange={e => props.setEnableHighlighting(e.target.checked)}
            />
            Enable Highlighting
          </label>
        </div>

        <div class="control-group">
          <label>
            <Toggle
              size="sm"
              checked={props.settings.showSimilarityPaths}
              onChange={e => props.setShowSimilarityPaths(e.target.checked)}
            />
            Show Similarity Paths
          </label>
        </div>

        <div class="control-group">
          <label>
            <Toggle
              size="sm"
              checked={props.settings.showSimilarityRadius}
              onChange={e => props.setShowSimilarityRadius(e.target.checked)}
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
          icon={getIcon("settings")}
        >
          Advanced Parameters
        </Button>

        <Button variant="primary" onClick={props.onRefresh} disabled={props.isLoading} icon={getIcon("refresh")}>
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
