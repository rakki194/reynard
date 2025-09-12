/**
 * JSON Editor Sub-components
 *
 * Sub-components for the JSON Editor to keep the main component
 * under the 140-line limit.
 */

import { Component, Show, For } from "solid-js";

interface ValidationMarker {
  startLineNumber: number;
  message: string;
}

// Editor header component
export const EditorHeader: Component<{
  title?: string;
  isValid: () => boolean;
  validationMarkers: () => ValidationMarker[];
  onFormat: () => void;
}> = (props) => (
  <div class="editor-header">
    <div class="editor-info">
      <span class="editor-title">{props.title || "JSON Editor"}</span>
      <span
        class="validation-status"
        classList={{
          valid: props.isValid(),
          invalid: !props.isValid(),
        }}
      >
        {props.isValid()
          ? "Valid JSON"
          : `${props.validationMarkers().length} error${props.validationMarkers().length !== 1 ? "s" : ""}`}
      </span>
    </div>
    <div class="editor-actions">
      <button
        type="button"
        class="format-button"
        onClick={() => props.onFormat()}
        disabled={!props.isValid()}
        title="Format JSON (Shift+Enter)"
      >
        Format
      </button>
    </div>
  </div>
);

// Error details component
export const ErrorDetails: Component<{
  validationMarkers: () => ValidationMarker[];
}> = (props) => (
  <Show when={props.validationMarkers().length > 0}>
    <div class="error-details">
      <div class="error-header">Validation Errors:</div>
      <For each={props.validationMarkers()}>
        {(marker: ValidationMarker) => (
          <div class="error-item">
            <span class="error-line">Line {marker.startLineNumber}:</span>
            <span class="error-message">{marker.message}</span>
          </div>
        )}
      </For>
    </div>
  </Show>
);
