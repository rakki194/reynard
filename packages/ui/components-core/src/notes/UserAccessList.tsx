/**
 * User Access List Component
 *
 * Displays and manages user-specific access permissions.
 */

import { Component, splitProps, For } from "solid-js";
import { Checkbox } from "reynard-primitives";
import type { User } from "./types";

export interface UserAccessListProps {
  /** Available users */
  users: User[];
  /** Currently allowed user IDs */
  allowedUsers: string[];
  /** Whether the list is disabled */
  disabled: boolean;
  /** Callback when a user is toggled */
  onUserToggle: (userId: string) => void;
}

export const UserAccessList: Component<UserAccessListProps> = props => {
  const [local] = splitProps(props, ["users", "allowedUsers", "disabled", "onUserToggle"]);

  return (
    <div style={{ "margin-bottom": "16px" }}>
      <span style={{ "font-weight": "500", "margin-bottom": "8px", display: "block" }}>User-Specific Access</span>
      <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
        <For each={local.users}>
          {user => (
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                padding: "8px",
                border: "1px solid #e1dfdd",
                "border-radius": "4px",
                "background-color": local.allowedUsers.includes(user.id) ? "#f3f2f1" : "white",
              }}
            >
              <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                <Checkbox
                  checked={local.allowedUsers.includes(user.id)}
                  onChange={() => local.onUserToggle(user.id)}
                  disabled={local.disabled}
                />
                <div>
                  <span style={{ "font-weight": "500" }}>{user.displayName || user.username}</span>
                  <div style={{ "font-size": "12px", color: "#605e5c" }}>{user.email}</div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default UserAccessList;
