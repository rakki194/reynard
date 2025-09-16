/**
 * Caption Generator Controls Component
 *
 * Generation controls and progress display for the caption generator.
 */

import type { CaptionGeneratorHandlers, CaptionGeneratorState } from "reynard-caption-core";
import { Component, Show } from "solid-js";

export interface CaptionGeneratorControlsProps {
  state: CaptionGeneratorState;
  handlers: CaptionGeneratorHandlers;
}

export const CaptionGeneratorControls: Component<CaptionGeneratorControlsProps> = props => {
  return (
    <>
      <div class="generation-controls">
        <button
          type="button"
          class="generate-button"
          classList={{ "generate-button--loading": props.state.isGenerating() }}
          onClick={() => props.handlers.generateCaption()}
          disabled={!props.state.imageFile() || props.state.isGenerating()}
        >
          <Show when={props.state.isGenerating()} fallback="Generate Caption">
            <div class="loading-spinner" />
            Generating... {props.state.generationProgress()}%
          </Show>
        </button>
      </div>

      <Show when={props.state.isGenerating()}>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style={{ width: `${props.state.generationProgress()}%` }} />
          </div>
        </div>
      </Show>

      <Show when={props.state.error()}>
        <div class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text">{props.state.error()}</div>
        </div>
      </Show>
    </>
  );
};
