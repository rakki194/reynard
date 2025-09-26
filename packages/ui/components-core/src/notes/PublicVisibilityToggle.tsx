/**
 * Public Visibility Toggle Component
 *
 * Handles the public/private visibility toggle for notes.
 */

import { Component, splitProps } from "solid-js";
import { Checkbox } from "reynard-primitives";
import { Icon } from "../icons/Icon";

export interface PublicVisibilityToggleProps {
  /** Whether the note is public */
  isPublic: boolean;
  /** Whether the toggle is disabled */
  disabled: boolean;
  /** Callback when visibility changes */
  onChange: () => void;
}

export const PublicVisibilityToggle: Component<PublicVisibilityToggleProps> = props => {
  const [local] = splitProps(props, ["isPublic", "disabled", "onChange"]);

  return (
    <div style={{ "margin-bottom": "16px" }}>
      <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
        <Checkbox checked={local.isPublic} onChange={local.onChange} disabled={local.disabled} />
        <div style={{ display: "flex", "align-items": "center", gap: "4px" }}>
          <Icon name={local.isPublic ? "eye" : "eye-off"} />
          <span>Public note</span>
        </div>
      </div>
      <span style={{ "font-size": "12px", color: "#605e5c", "margin-left": "24px" }}>
        {local.isPublic ? "This note is visible to everyone" : "This note has restricted visibility"}
      </span>
    </div>
  );
};

export default PublicVisibilityToggle;
