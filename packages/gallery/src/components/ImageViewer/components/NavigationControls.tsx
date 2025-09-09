/**
 * NavigationControls Component
 * Navigation control buttons
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";
import type { NavigationControlsProps } from "../types";

export const NavigationControls: Component<NavigationControlsProps> = (
  props,
) => {
  return (
    <div class="reynard-image-viewer__nav-controls">
      <Button size="sm" variant="ghost" onClick={props.onReset}>
        Reset
      </Button>
      <Button size="sm" variant="ghost" onClick={props.onFitToView}>
        Fit
      </Button>
    </div>
  );
};
