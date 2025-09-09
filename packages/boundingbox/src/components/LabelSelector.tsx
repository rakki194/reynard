/**
 * Label Selector Component
 *
 * Provides label selection and management for bounding box annotations
 */

import type { Component } from "solid-js";
import { createSignal, For, Show } from "solid-js";

export interface LabelSelectorProps {
  availableLabels: string[];
  selectedLabel: string;
  onLabelChange: (label: string) => void;
  onAddLabel?: (label: string) => void;
  className?: string;
}

export const LabelSelector: Component<LabelSelectorProps> = (props) => {
  const [newLabel, setNewLabel] = createSignal("");
  const [showAddForm, setShowAddForm] = createSignal(false);

  const handleLabelSelect = (label: string) => {
    props.onLabelChange(label);
  };

  const handleAddLabel = () => {
    const label = newLabel().trim();
    if (label && !props.availableLabels.includes(label)) {
      props.onAddLabel?.(label);
      setNewLabel("");
      setShowAddForm(false);
    }
  };

  const handleCancelAdd = () => {
    setNewLabel("");
    setShowAddForm(false);
  };

  return (
    <div class={`label-selector ${props.className || ""}`}>
      <div class="label-list">
        <For each={props.availableLabels}>
          {(label) => (
            <button
              class={`label-button ${props.selectedLabel === label ? "selected" : ""}`}
              onClick={() => handleLabelSelect(label)}
            >
              {label}
            </button>
          )}
        </For>
      </div>

      <Show when={props.onAddLabel}>
        <div class="add-label-section">
          <Show when={!showAddForm()}>
            <button
              class="add-label-button"
              onClick={() => setShowAddForm(true)}
            >
              + Add Label
            </button>
          </Show>

          <Show when={showAddForm()}>
            <div class="add-label-form">
              <input
                type="text"
                value={newLabel()}
                onInput={(e) => setNewLabel(e.currentTarget.value)}
                placeholder="Enter new label"
                class="label-input"
              />
              <button
                class="save-label-button"
                onClick={handleAddLabel}
                disabled={!newLabel().trim()}
              >
                Save
              </button>
              <button class="cancel-label-button" onClick={handleCancelAdd}>
                Cancel
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
