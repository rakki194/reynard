/**
 * Instructions Component
 * User interaction instructions
 */

import { Component, Show } from "solid-js";
import type { InstructionsProps } from "../types";

export const Instructions: Component<InstructionsProps> = props => {
  return (
    <Show when={props.enableZoom || props.enablePan}>
      <div class="reynard-image-viewer__instructions">
        <Show when={props.enableZoom}>
          <span>Scroll to zoom</span>
        </Show>
        <Show when={props.enablePan}>
          <span>Drag to pan</span>
        </Show>
      </div>
    </Show>
  );
};
