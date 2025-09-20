/**
 * ZoomControls Component
 * Zoom control buttons and display
 */

import { Component } from "solid-js";
import { Button } from "reynard-components-core";
import type { ZoomControlsProps } from "../types";

export const ZoomControls: Component<ZoomControlsProps> = props => {
  return (
    <div class="reynard-image-viewer__zoom-controls">
      <Button size="sm" variant="ghost" onClick={props.onZoomOut} disabled={props.zoom <= props.minZoom}>
        -
      </Button>
      <span class="reynard-image-viewer__zoom-level">{Math.round(props.zoom * 100)}%</span>
      <Button size="sm" variant="ghost" onClick={props.onZoomIn} disabled={props.zoom >= props.maxZoom}>
        +
      </Button>
    </div>
  );
};
