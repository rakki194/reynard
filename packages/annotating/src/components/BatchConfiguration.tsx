/**
 * Batch Configuration Component
 *
 * Configuration panel for batch processing options.
 */

import { Component, For } from "solid-js";

export interface BatchConfigurationProps {
  selectedGenerator: string;
  availableGenerators: string[];
  maxConcurrent: number;
  force: boolean;
  postProcess: boolean;
  disabled?: boolean;
  onGeneratorChange: (generator: string) => void;
  onMaxConcurrentChange: (value: number) => void;
  onForceChange: (force: boolean) => void;
  onPostProcessChange: (postProcess: boolean) => void;
  class?: string;
}

export const BatchConfiguration: Component<BatchConfigurationProps> = (
  props,
) => {
  return (
    <div class={`batch-config ${props.class || ""}`}>
      <div class="config-group">
        <label for="generator-select">Default Generator:</label>
        <select
          id="generator-select"
          value={props.selectedGenerator}
          onChange={(e) => props.onGeneratorChange(e.currentTarget.value)}
          disabled={props.disabled}
          aria-label="Select default caption generator"
        >
          <For each={props.availableGenerators}>
            {(generator) => <option value={generator}>{generator}</option>}
          </For>
        </select>
      </div>

      <div class="config-group">
        <label for="max-concurrent">Max Concurrent:</label>
        <input
          id="max-concurrent"
          type="number"
          min="1"
          max="8"
          value={props.maxConcurrent}
          onChange={(e) =>
            props.onMaxConcurrentChange(parseInt(e.currentTarget.value) || 4)
          }
          disabled={props.disabled}
          aria-label="Maximum concurrent processing tasks"
        />
      </div>

      <div class="config-group">
        <label>
          <input
            type="checkbox"
            checked={props.force}
            onChange={(e) => props.onForceChange(e.currentTarget.checked)}
            disabled={props.disabled}
            aria-label="Force regeneration of existing captions"
          />
          Force Regeneration
        </label>
      </div>

      <div class="config-group">
        <label>
          <input
            type="checkbox"
            checked={props.postProcess}
            onChange={(e) => props.onPostProcessChange(e.currentTarget.checked)}
            disabled={props.disabled}
            aria-label="Apply post-processing to generated captions"
          />
          Post-Process Captions
        </label>
      </div>
    </div>
  );
};
