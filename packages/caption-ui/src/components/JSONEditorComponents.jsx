/**
 * JSON Editor Sub-components
 *
 * Sub-components for the JSON Editor to keep the main component
 * under the 140-line limit.
 */
import { Show, For } from "solid-js";
// Editor header component
export const EditorHeader = (props) => (<div class="editor-header">
    <div class="editor-info">
      <span class="editor-title">{props.title || "JSON Editor"}</span>
      <span class="validation-status" classList={{
        valid: props.isValid(),
        invalid: !props.isValid(),
    }}>
        {props.isValid()
        ? "Valid JSON"
        : `${props.validationMarkers().length} error${props.validationMarkers().length !== 1 ? "s" : ""}`}
      </span>
    </div>
    <div class="editor-actions">
      <button type="button" class="format-button" onClick={() => props.onFormat()} disabled={!props.isValid()} title="Format JSON (Shift+Enter)">
        Format
      </button>
    </div>
  </div>);
// Error details component
export const ErrorDetails = (props) => (<Show when={props.validationMarkers().length > 0}>
    <div class="error-details">
      <div class="error-header">Validation Errors:</div>
      <For each={props.validationMarkers()}>
        {(marker) => (<div class="error-item">
            <span class="error-line">Line {marker.startLineNumber}:</span>
            <span class="error-message">{marker.message}</span>
          </div>)}
      </For>
    </div>
  </Show>);
