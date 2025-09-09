/**
 * Batch Progress Component
 * 
 * Progress tracking display for batch processing.
 */

import { Component, Show } from "solid-js";

export interface BatchProgressProps {
  total: number;
  completed: number;
  processing: number;
  errors: number;
  percentage: number;
  class?: string;
}

export const BatchProgress: Component<BatchProgressProps> = (props) => {
  return (
    <Show when={props.total > 0}>
      <div class={`progress-section ${props.class || ""}`}>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style={`--progress-width: ${props.percentage}%`}
          />
        </div>
        <div class="progress-text">
          {props.percentage}% ({props.completed}/{props.total})
        </div>
      </div>
    </Show>
  );
};
