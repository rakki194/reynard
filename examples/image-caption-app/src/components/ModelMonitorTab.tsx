/**
 * Model Monitor Tab Component
 *
 * Displays AI model statistics and monitoring information.
 */

import { Component } from "solid-js";
import type { UseAppStateReturn } from "../composables/useAppState";

interface ModelMonitorTabProps {
  appState: UseAppStateReturn;
}

export const ModelMonitorTab: Component<ModelMonitorTabProps> = (props) => {
  return (
    <div class="models-section">
      <h3>AI Model Monitor</h3>
      <div class="model-info">
        <div class="model-card">
          <h4>Current Model: {props.appState.selectedModel()}</h4>
          <p>
            Status: {props.appState.isGenerating() ? "Generating..." : "Ready"}
          </p>
        </div>
        <div class="model-stats">
          <h4>Model Statistics</h4>
          <ul>
            <li>Total Images Processed: {props.appState.images().length}</li>
            <li>
              Images with Captions:{" "}
              {props.appState.images().filter((img) => img.caption).length}
            </li>
            <li>
              Success Rate:{" "}
              {props.appState.images().length > 0
                ? Math.round(
                    (props.appState.images().filter((img) => img.caption)
                      .length /
                      props.appState.images().length) *
                      100,
                  )
                : 0}
              %
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
