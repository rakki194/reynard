/**
 * Action Buttons Component
 *
 * Handles save and reset actions for visibility changes.
 */

import { Component, splitProps, Show } from "solid-js";
import { Button } from "reynard-primitives";

export interface ActionButtonsProps {
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Whether the component is in loading state */
  isLoading: boolean;
  /** Whether the buttons should be shown */
  canModify: boolean;
  /** Callback for reset action */
  onReset: () => void;
  /** Callback for save action */
  onSave: () => void;
}

export const ActionButtons: Component<ActionButtonsProps> = props => {
  const [local] = splitProps(props, ["hasChanges", "isLoading", "canModify", "onReset", "onSave"]);

  return (
    <Show when={local.canModify}>
      <div style={{ display: "flex", gap: "8px", "justify-content": "flex-end" }}>
        <Show when={local.hasChanges}>
          <Button variant="secondary" onClick={local.onReset} disabled={local.isLoading}>
            Reset
          </Button>
        </Show>
        <Button
          variant="primary"
          onClick={local.onSave}
          disabled={!local.hasChanges || local.isLoading}
          loading={local.isLoading}
        >
          {local.isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Show>
  );
};

export default ActionButtons;
