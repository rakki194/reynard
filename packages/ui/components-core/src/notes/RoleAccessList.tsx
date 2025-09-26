/**
 * Role Access List Component
 *
 * Displays and manages role-based access permissions.
 */

import { Component, splitProps, For, Show } from "solid-js";
import { Checkbox } from "reynard-primitives";
import type { Role } from "./types";

export interface RoleAccessListProps {
  /** Available roles */
  roles: Role[];
  /** Currently allowed role IDs */
  allowedRoles: string[];
  /** Whether the list is disabled */
  disabled: boolean;
  /** Callback when a role is toggled */
  onRoleToggle: (roleId: string) => void;
}

export const RoleAccessList: Component<RoleAccessListProps> = props => {
  const [local] = splitProps(props, ["roles", "allowedRoles", "disabled", "onRoleToggle"]);

  const sortedRoles = () => [...local.roles].sort((a, b) => b.level - a.level);

  return (
    <div style={{ "margin-bottom": "16px" }}>
      <span style={{ "font-weight": "500", "margin-bottom": "8px", display: "block" }}>Role-Based Access</span>
      <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
        <For each={sortedRoles()}>
          {role => (
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                padding: "8px",
                border: "1px solid #e1dfdd",
                "border-radius": "4px",
                "background-color": local.allowedRoles.includes(role.id) ? "#f3f2f1" : "white",
              }}
            >
              <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                <Checkbox
                  checked={local.allowedRoles.includes(role.id)}
                  onChange={() => local.onRoleToggle(role.id)}
                  disabled={local.disabled}
                />
                <div>
                  <div style={{ display: "flex", "align-items": "center", gap: "4px" }}>
                    <span style={{ "font-weight": "500" }}>{role.displayName}</span>
                    <span class="reynard-badge reynard-badge--brand">Level {role.level}</span>
                  </div>
                  <Show when={role.description}>
                    <span style={{ "font-size": "12px", color: "#605e5c" }}>{role.description}</span>
                  </Show>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default RoleAccessList;
