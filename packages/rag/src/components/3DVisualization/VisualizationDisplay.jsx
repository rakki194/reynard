/**
 * Visualization Display Component
 *
 * Renders the 3D point cloud visualization and related UI elements
 */
import { Show } from "solid-js";
import { Button } from "reynard-components";
export const VisualizationDisplay = (props) => {
    return (<div class="rag-3d-visualization">
      <Show when={props.isLoading}>
        <div class="rag-3d-loading">
          <div class="loading-spinner"></div>
          <span>Loading embedding visualization...</span>
        </div>
      </Show>

      <Show when={props.error}>
        <div class="rag-3d-error">
          <span>Error: {props.error}</span>
          <Button onClick={props.onRetry}>Retry</Button>
        </div>
      </Show>

      <Show when={!props.isLoading && !props.error && props.embeddingPoints.length > 0}>
        <div class="rag-3d-point-cloud">
          {/* This would integrate with the existing reynard-3d package */}
          <div class="placeholder-3d-visualization">
            <p>3D Point Cloud Visualization</p>
            <p>Points: {props.embeddingPoints.length}</p>
            <p>Method: {props.reductionMethod.toUpperCase()}</p>
            <p>Query: "{props.searchQuery}"</p>
          </div>
        </div>
      </Show>
    </div>);
};
