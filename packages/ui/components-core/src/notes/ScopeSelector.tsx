/**
 * Scope Selector Component
 *
 * Handles the selection of access scope for notes.
 */

import { Component, splitProps } from "solid-js";
import { Icon } from "../icons/Icon";
import { getScopeDescription, getScopeIcon } from "./utils";

export interface ScopeSelectorProps {
  /** Current scope value */
  scope: string;
  /** Whether the selector is disabled */
  disabled: boolean;
  /** Callback when scope changes */
  onChange: (scope: string) => void;
}

export const ScopeSelector: Component<ScopeSelectorProps> = props => {
  const [local] = splitProps(props, ["scope", "disabled", "onChange"]);

  return (
    <div style={{ "margin-bottom": "16px" }}>
      <span style={{ "font-weight": "500", "margin-bottom": "8px", display: "block" }}>Access Scope</span>
      <select
        value={local.scope}
        onChange={e => local.onChange(e.currentTarget.value)}
        disabled={local.disabled}
        style={{ width: "200px" }}
        class="reynard-select"
      >
        <option value="own">Own</option>
        <option value="team">Team</option>
        <option value="organization">Organization</option>
        <option value="global">Global</option>
      </select>
      <div style={{ display: "flex", "align-items": "center", gap: "4px", "margin-top": "4px" }}>
        <Icon name={getScopeIcon(local.scope)} />
        <span style={{ "font-size": "12px", color: "#605e5c" }}>{getScopeDescription(local.scope)}</span>
      </div>
    </div>
  );
};

export default ScopeSelector;
